import fetch from 'node-fetch';

export async function queryVideoGeneration(taskId: string) {
  const url = `https://api.minimax.chat/v1/query/video_generation?task_id=${taskId}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Raw API response:", JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("Error querying video generation status:", error);
    return null;
  }
}