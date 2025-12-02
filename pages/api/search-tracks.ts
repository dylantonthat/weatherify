import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { accessToken, genres, limit } = req.body

  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ error: 'Access token is required' })
  }

  if (!genres || !Array.isArray(genres) || genres.length === 0) {
    return res.status(400).json({ error: 'Genres array is required' })
  }

  try {
    // Search for tracks using genre names as search terms
    // Spotify Search API doesn't support genre: queries, so we search for the genre name
    const searchPromises = genres.slice(0, 2).map(async (genre: string) => {
      // Search for tracks with the genre name in the query
      // This will find popular tracks associated with that genre
      const query = genre
      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${Math.ceil((limit || 20) / genres.length)}&market=US`
      
      try {
        const response = await fetch(searchUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Search failed for genre ${genre}:`, response.status, errorText)
          return []
        }
        
        const data = await response.json()
        return data.tracks?.items || []
      } catch (error) {
        console.error(`Error searching for genre ${genre}:`, error)
        return []
      }
    })
    
    const results = await Promise.all(searchPromises)
    const allTracks = results.flat()
    
    // Remove duplicates
    const uniqueTracks = Array.from(
      new Map(allTracks.map((track: any) => [track.id, track])).values()
    )
    
    // Shuffle and limit
    const shuffled = uniqueTracks.sort(() => Math.random() - 0.5)
    const limitedTracks = shuffled.slice(0, limit || 20)
    
    return res.status(200).json({ tracks: limitedTracks })
  } catch (error: any) {
    console.error('Error in search-tracks API route:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

