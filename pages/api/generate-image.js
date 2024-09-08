import Replicate from "replicate";
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import fetch from 'node-fetch';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

if (!getApps().length) {
  try {
    console.log("FIREBASE_SERVICE_ACCOUNT_KEY length:", process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length);
    console.log("FIREBASE_STORAGE_BUCKET:", process.env.FIREBASE_STORAGE_BUCKET);
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });

    const storage = getStorage();
    storage.bucket(process.env.FIREBASE_STORAGE_BUCKET); // Explicitly set the bucket

    console.log("Firebase app and Storage initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase app:", error);
    throw error;
  }
}

const db = getFirestore();
const bucket = getStorage().bucket();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { prompt, userId, num_outputs, aspect_ratio, model } = req.body;

        console.log("Received prompt:", prompt);
        console.log("Number of outputs:", num_outputs);
        console.log("Aspect ratio:", aspect_ratio);
        console.log("Selected model:", model);

        // Select the appropriate model based on the user's choice
        let modelVersion;
        switch (model) {
            case 'flux-schnell':
                modelVersion = "black-forest-labs/flux-schnell";
                break;
            case 'flux-dev':
                modelVersion = "black-forest-labs/flux-dev";
                break;
            case 'flux-pro':
                modelVersion = "black-forest-labs/flux-pro";
                break;
            default:
                modelVersion = "black-forest-labs/flux-schnell";
        }

        const output = await replicate.run(
            modelVersion,
            {
                input: {
                    prompt: prompt,
                    num_outputs: num_outputs,
                    num_inference_steps: 50,
                    guidance_scale: 7.5,
                    scheduler: "DPMSolverMultistep",
                    aspect_ratio: aspect_ratio,
                }
            }
        );

        console.log("Replicate output:", output);

        // Process all generated images
        const urls = await Promise.all(output.map(async (imageUrl, index) => {
            // Download the image
            const imageResponse = await fetch(imageUrl);
            const imageBuffer = await imageResponse.buffer();

            // Upload to Firebase Storage in the images folder
            const fileName = `${userId}/images/${Date.now()}_${index}.png`;
            const file = bucket.file(fileName);
            await file.save(imageBuffer, {
                metadata: { contentType: 'image/png' }
            });

            // Get the public URL
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-01-2500'
            });

            return url;
        }));

        // Save to Firestore
        await db.collection('users').doc(userId).collection('images').add({
            prompt: prompt,
            imageUrls: urls,
            createdAt: new Date()
        });

        res.status(200).json({ output: urls });
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ 
            message: 'Error generating image', 
            error: error.message,
            stack: error.stack,
            details: error.response ? error.response.data : null
        });
    }
}