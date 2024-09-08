import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { imageUrl } = req.query;

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    const response = await fetch(imageUrl);
    const contentType = response.headers.get('content-type');
    const buffer = await response.buffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'attachment; filename=generated-image.png');
    res.send(buffer);
  } catch (error) {
    console.error('Error downloading image:', error);
    res.status(500).json({ error: 'Failed to download image' });
  }
}