import { NextApiRequest, NextApiResponse } from 'next';
import { db, storage } from '../../firebaseAdmin';
import { queryVideoGeneration } from '../../utils/minimax';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { taskId, userId, videoId } = req.body;

    try {
        console.log("taskId", taskId)
        const minimaxData = await retryQueryVideoGeneration(taskId);

        if (!minimaxData) {
            throw new Error('Failed to query video generation status');
        }
        if (minimaxData.status === 'Success') {
            const fileId = minimaxData.file_id;
            const downloadUrl = await fetchVideoResult(fileId);

            const response = await fetch(downloadUrl);
            const videoBuffer = Buffer.from(await response.arrayBuffer());

            const file = storage.bucket().file(`users/${userId}/videos/${videoId}.mp4`);
            await file.save(videoBuffer, {
                metadata: { contentType: 'video/mp4' }
            });

            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-01-2500'
            });

            await db.collection('users').doc(userId).collection('videoTasks').doc(videoId).update({
                status: 'Success',
                videoUrl: url,
            });

            return res.status(200).json({ status: 'Success', videoUrl: url });
        } else {
            return res.status(200).json({ status: 'Processing' });
        }
    } catch (error) {
        console.error('Error checking video status:', error);
        if (error instanceof Error && error.message.includes('ENOTFOUND')) {
            return res.status(503).json({ message: 'Unable to reach Minimax API after multiple attempts. Please try again later.' });
        }
        return res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
}

async function retryQueryVideoGeneration(taskId: string, retries = MAX_RETRIES): Promise<any> {
    try {
        return await queryVideoGeneration(taskId);
    } catch (error) {
        if (retries > 0 && error instanceof Error && error.message.includes('ENOTFOUND')) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return retryQueryVideoGeneration(taskId, retries - 1);
        }
        throw error;
    }
}

async function fetchVideoResult(fileId: string) {
    const url = `https://api.minimax.chat/v1/files/retrieve?file_id=${fileId}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`
        }
    });
    const data = await response.json();
    return data.file.download_url;
}