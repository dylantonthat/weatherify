// get and refresh access token
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&client_id=${process.env.SPOTIFY_ID}&client_secret=${process.env.SPOTIFY_SECRET}`,
    };

    const response = await fetch('https://accounts.spotify.com/api/token', authParameters);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error fetching Spotify token:', error);
    res.status(500).json({ error: 'An error occurred while fetching the Spotify token.' });
  }
}
