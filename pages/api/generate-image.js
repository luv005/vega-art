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

        const response = await replicate.run(
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

        console.log("Replicate API response:", JSON.stringify(response, null, 2));

        let imageUrls = [];
        if (typeof response === 'string' && response.startsWith('http')) {
            // If the response is a single URL string
            imageUrls = [response];
        } else if (Array.isArray(response)) {
            imageUrls = response;
        } else if (response.output && Array.isArray(response.output)) {
            imageUrls = response.output;
        } else if (typeof response === 'object') {
            imageUrls = Object.values(response).filter(value => typeof value === 'string' && value.startsWith('http'));
        }

        if (imageUrls.length === 0) {
            throw new Error(`No image URLs found in Replicate API response: ${JSON.stringify(response)}`);
        }

        const storedImages = await Promise.all(imageUrls.map(async (imageUrl, index) => {
            try {
                console.log(`Downloading image ${index + 1}...`);
                const imageResponse = await fetch(imageUrl);
                const buffer = await imageResponse.buffer();

                const filename = `${userId}/images/${Date.now()}_${index}.png`;
                console.log(`Uploading image ${index + 1} to ${filename}...`);

                const file = bucket.file(filename);
                await file.save(buffer, {
                    metadata: {
                        contentType: 'image/png',
                    },
                });

                console.log(`Image ${index + 1} uploaded successfully.`);

                const [url] = await file.getSignedUrl({
                    action: 'read',
                    expires: '03-01-2500',
                });

                console.log(`Generated signed URL for image ${index + 1}: ${url}`);

                return {
                    url: url,
                    filename: filename
                };
            } catch (error) {
                console.error(`Error storing image ${index + 1}:`, error);
                return null;
            }
        }));

        const successfulUploads = storedImages.filter(img => img !== null);

        if (successfulUploads.length === 0) {
            throw new Error("All image uploads failed");
        }

        console.log(`Successfully uploaded ${successfulUploads.length} images.`);

        const imageCollection = db.collection('users').doc(userId).collection('images');
        const batch = db.batch();

        if (successfulUploads.length === 1) {
            // Single image
            const docRef = imageCollection.doc();
            batch.set(docRef, {
                imageUrl: successfulUploads[0].url,
                filename: successfulUploads[0].filename,
                prompt: prompt,
                createdAt: new Date(),
                model: model
            });
        } else {
            // Multiple images
            const docRef = imageCollection.doc();
            batch.set(docRef, {
                imageUrls: successfulUploads.map(img => img.url),
                filenames: successfulUploads.map(img => img.filename),
                prompt: prompt,
                createdAt: new Date(),
                model: model
            });
        }

        try {
            await batch.commit();
            console.log(`Added ${successfulUploads.length > 1 ? 'multiple images' : 'single image'} document to Firestore`);
        } catch (error) {
            console.error('Error adding documents to Firestore:', error);
            throw error; // This will be caught by the outer try-catch block
        }

        res.status(200).json({ 
            success: true, 
            output: successfulUploads.length === 1 ? 
                { imageUrl: successfulUploads[0].url } : 
                { imageUrls: successfulUploads.map(img => img.url) },
            prompt: prompt,
            model: model,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating or storing image:', error);
        // If images were uploaded to Storage but not added to Firestore, we should delete them
        if (successfulUploads && successfulUploads.length > 0) {
            try {
                await Promise.all(successfulUploads.map(img => bucket.file(img.filename).delete()));
                console.log('Deleted uploaded images due to Firestore error');
            } catch (deleteError) {
                console.error('Error deleting uploaded images:', deleteError);
            }
        }
        res.status(500).json({ success: false, error: error.message, details: error.stack });
    }
}