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
    // Get user's country for market parameter
    let market = 'US' // default
    try {
      const userResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (userResponse.ok) {
        const userData = await userResponse.json()
        market = userData.country || 'US'
      }
    } catch (error) {
      console.log('Could not fetch user country, using US as default')
    }

    // Search for tracks using genre names as search terms
    // Spotify Search API doesn't support genre: queries, so we search for the genre name
    const searchPromises = genres.slice(0, 2).map(async (genre: string) => {
      // Search for tracks with the genre name in the query
      // This will find popular tracks associated with that genre
      const query = `genre:${genre}`
      const perGenreLimit = Math.max(Math.ceil((limit || 20) / genres.length), 10)
      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${perGenreLimit}&market=${market}`
      
      try {
        const response = await fetch(searchUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Search failed for genre ${genre}:`, response.status, errorText)
          // Try a simpler search without genre: prefix
          const fallbackUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(genre)}&type=track&limit=${perGenreLimit}&market=${market}`
          const fallbackResponse = await fetch(fallbackUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            return fallbackData.tracks?.items || []
          }
          return []
        }
        
        const data = await response.json()
        const tracks = data.tracks?.items || []
        
        // If no results, try a simpler search
        if (tracks.length === 0) {
          const fallbackUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(genre)}&type=track&limit=${perGenreLimit}&market=${market}`
          const fallbackResponse = await fetch(fallbackUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            return fallbackData.tracks?.items || []
          }
        }
        
        return tracks
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
    
    // If we still don't have enough tracks, do a general popular search
    if (uniqueTracks.length < (limit || 20)) {
      try {
        const popularUrl = `https://api.spotify.com/v1/search?q=year:2020-2024&type=track&limit=${(limit || 20) - uniqueTracks.length}&market=${market}`
        const popularResponse = await fetch(popularUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        if (popularResponse.ok) {
          const popularData = await popularResponse.json()
          const popularTracks = popularData.tracks?.items || []
          popularTracks.forEach((track: any) => {
            if (!uniqueTracks.find((t: any) => t.id === track.id)) {
              uniqueTracks.push(track)
            }
          })
        }
      } catch (error) {
        console.error('Error fetching popular tracks:', error)
      }
    }
    
    // Shuffle and limit
    const shuffled = uniqueTracks.sort(() => Math.random() - 0.5)
    const limitedTracks = shuffled.slice(0, limit || 20)
    
    console.log(`Returning ${limitedTracks.length} tracks from search`)
    
    return res.status(200).json({ tracks: limitedTracks })
  } catch (error: any) {
    console.error('Error in search-tracks API route:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

