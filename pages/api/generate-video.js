import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import fetch from 'node-fetch';
import { queryVideoGeneration } from '../../utils/minimax';

if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });

    console.log("Firebase app and Storage initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase app:", error);
    throw error;
  }
}

const db = getFirestore();
const bucket = getStorage().bucket();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchVideoResult = async (taskId) => {
  try {
    const response = await fetch(`https://api.minimax.chat/v1/files/retrieve?file_id=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const responseText = await response.text();
    console.log('Raw API response:', responseText);

    try {
      const data = JSON.parse(responseText);
      console.log("data", data)
      console.log("download url", data.file.download_url)
      // Ensure the download_url is an absolute UR
      
      return data.file;
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      if (responseText.includes('binding:')) {
        // Handle the specific error case
        const errorObj = {
          error: 'Binding error',
          message: responseText
        };
        return errorObj;
      }
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
  } catch (error) {
    console.error('Error fetching video result:', error);
    throw error;
  }
};

export default async function handler(req, res) {
    console.log("API route hit: /api/generate-video"); // Debug log

    if (req.method !== 'POST') {
        console.log("Method not allowed:", req.method); // Debug log
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { prompt, userId } = req.body;
        console.log("Received prompt:", prompt); // Debug log
        console.log("Received userId:", userId);

        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw new Error('Invalid or missing userId');
        }

        // Submit video generation task
        const response = await fetch('https://api.minimax.chat/v1/video_generation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`
            },
            body: JSON.stringify({
                model: "video-01", 
                prompt: prompt,
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const taskId = data.task_id;
        console.log("task data", data)
        console.log("Received taskId:", taskId); // Add this line

        // Create a document in Firestore to track the task
        const taskRef = await db.collection('users').doc(userId.trim()).collection('videoTasks').add({
            taskId,
            prompt,
            status: 'Queuing',
            createdAt: new Date()
        });
        console.log("Created Firestore document for video task:", taskRef.id);

        // Start polling for task status
        let status = 'Queuing';
        let fileId = '';
        let retryCount = 0;
        const maxRetries = 10; // Maximum number of retries

        while (status !== 'Success' && status !== 'Fail' && retryCount < maxRetries) {
            await delay(30000); // Wait for 30 seconds

            const statusData = await queryVideoGeneration(taskId);
            console.log("Status data:", JSON.stringify(statusData)); // Modify this line

            if (statusData && statusData.status) {
                status = statusData.status;
                
                // Update task status in Firestore only if status is defined
                await taskRef.update({ status });

                if (status === 'Success') {
                    fileId = statusData.file_id;
                }
                retryCount = 0; // Reset retry count on successful status update
            } else {
                console.log("Invalid status data received:", JSON.stringify(statusData));
                retryCount++;
                console.log(`Retry attempt ${retryCount} of ${maxRetries}`);
            }
            console.log("Current status:", status);
        }

        if (retryCount >= maxRetries) {
            throw new Error('Max retries reached. Unable to fetch task status.');
        }

        if (status === 'Success') {
            // Fetch video result
            console.log("Fetching video result for fileId:", fileId);
            const videoResult = await fetchVideoResult(fileId);

            if (videoResult.error) {
                console.error('Error fetching video:', videoResult.message);
                await taskRef.update({
                    status: 'Failed',
                    error: videoResult.message,
                    completedAt: new Date()
                });
                res.status(200).json({ status: 'Fail', error: 'Error fetching video' });
                return;
            }

            // Ensure we have a valid download URL
            if (!videoResult.download_url || typeof videoResult.download_url !== 'string') {
                throw new Error('Invalid or missing download URL');
            }

            console.log("Downloading video from URL:", videoResult.download_url);

            // Download the video
            const videoResponse = await fetch(videoResult.download_url);
            if (!videoResponse.ok) {
                throw new Error(`Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`);
            }
            const videoBuffer = await videoResponse.buffer();

            // Upload to Firebase Storage
            const fileName = `${userId}/videos/${Date.now()}.mp4`;
            const file = bucket.file(fileName);
            await file.save(videoBuffer, {
                metadata: { contentType: 'video/mp4' }
            });

            // Get the public URL
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-01-2500'
            });

            // Update Firestore document
            await taskRef.update({
                videoUrl: url,
                completedAt: new Date()
            });
            console.log("Updated Firestore document with video URL:", url);

            res.status(200).json({ output: url, status: 'Success' });
        } else {
            // Update Firestore document with failure status
            await taskRef.update({
                completedAt: new Date(),
                error: 'Video generation failed'
            });

            res.status(200).json({ status: 'Fail', error: 'Video generation failed' });
        }
    } catch (error) {
        console.error('Error generating video:', error);
        res.status(500).json({ 
            message: 'Error generating video', 
            error: error.message,
            stack: error.stack,
            details: error.response ? await error.response.text() : null
        });
    }
}