import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { videoUrl } = req.query;

  if (!videoUrl) {
    return res.status(400).json({ error: 'Video URL is required' });
  }

  try {
    const response = await fetch(videoUrl);
    const contentType = response.headers.get('content-type');
    const buffer = await response.buffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'attachment; filename=generated-video.mp4');
    res.send(buffer);
  } catch (error) {
    console.error('Error downloading video:', error);
    res.status(500).json({ error: 'Failed to download video' });
  }
}