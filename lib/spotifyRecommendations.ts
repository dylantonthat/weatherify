import {
  adjustForTemperature,
  getWeatherMusicParams
} from './weatherMusicMapping';

export interface Track {
  id: string
  name: string
  artists: Array<{ name: string; id: string }>
  album: {
    name: string
    images: Array<{ url: string; height: number; width: number }>
  }
  external_urls: {
    spotify: string
  }
  preview_url: string | null
  duration_ms: number
}

export interface RecommendationsResponse {
  tracks: Track[]
}


/**
 * Get recommended tracks from Spotify based on weather data
 * Uses Search API as alternative to deprecated Recommendations API
 */
export async function getRecommendedSongs(
  accessToken: string,
  weatherData: any,
  limit: number = 15
): Promise<Track[]> {
  if (!accessToken) {
    throw new Error('Access token is required')
  }

  if (!weatherData || !weatherData.weather || weatherData.weather.length === 0) {
    throw new Error('Weather data is required')
  }

  // Get music parameters based on weather
  const weatherDescription = weatherData.weather[0].description
  const temperature = weatherData.main?.temp

  let musicParams = getWeatherMusicParams(weatherDescription, temperature)

  // Adjust for temperature if available
  if (temperature !== undefined) {
    musicParams = adjustForTemperature(musicParams, temperature)
  }

  // Build query parameters for Spotify Recommendations API
  const queryParams = new URLSearchParams()

  // Spotify valid genres (using only verified genres)
  const validGenres = [
    'acoustic', 'afrobeat', 'alt-rock', 'alternative', 'ambient', 'anime',
    'black-metal', 'bluegrass', 'blues', 'bossanova', 'brazil', 'breakbeat',
    'british', 'cantopop', 'chicago-house', 'children', 'chill', 'classical',
    'club', 'comedy', 'country', 'dance', 'dancehall', 'death-metal',
    'deep-house', 'detroit-techno', 'disco', 'disney', 'drum-and-bass',
    'dub', 'dubstep', 'edm', 'electro', 'electronic', 'emo', 'folk',
    'forro', 'french', 'funk', 'garage', 'german', 'gospel', 'goth',
    'grindcore', 'groove', 'grunge', 'guitar', 'happy', 'hard-rock',
    'hardcore', 'hardstyle', 'heavy-metal', 'hip-hop', 'holidays', 'honky-tonk',
    'house', 'idm', 'indian', 'indie', 'indie-pop', 'industrial', 'iranian',
    'j-dance', 'j-idol', 'j-pop', 'j-rock', 'jazz', 'k-pop', 'kids',
    'latin', 'latino', 'malay', 'mandopop', 'metal', 'metal-misc', 'metalcore',
    'minimal-techno', 'movies', 'mpb', 'new-age', 'new-release', 'opera',
    'pagode', 'party', 'philippines-opm', 'piano', 'pop', 'pop-film',
    'post-dubstep', 'power-pop', 'progressive-house', 'psych-rock', 'punk',
    'punk-rock', 'r-n-b', 'rainy-day', 'reggae', 'reggaeton', 'road-trip',
    'rock', 'rock-n-roll', 'rockabilly', 'romance', 'sad', 'salsa',
    'samba', 'sertanejo', 'show-tunes', 'singer-songwriter', 'ska', 'sleep',
    'songwriter', 'soul', 'soundtracks', 'spanish', 'study', 'summer',
    'swedish', 'synth-pop', 'tango', 'techno', 'trance', 'trip-hop',
    'turkish', 'work-out', 'world-music'
  ]

  // Filter and use only valid genres (use 1-2 genres to be safe)
  // Note: 'indie-pop' might not be valid, use 'indie' and 'pop' separately
  const normalizedGenres = musicParams.seed_genres?.map(g => {
    // Replace 'indie-pop' with 'indie' since it might not be a valid genre
    if (g.toLowerCase() === 'indie-pop') return 'indie'
    return g.toLowerCase()
  }) || []
  
  const validSeedGenres = normalizedGenres
    .filter((genre) => validGenres.includes(genre))
    .slice(0, 2) // Use max 2 genres to be safe

  // Spotify requires at least one seed, and total seeds (genres + artists + tracks) must be 1-5
  // Use genres as primary seeds
  if (validSeedGenres && validSeedGenres.length > 0) {
    queryParams.append('seed_genres', validSeedGenres.join(','))
  } else {
    // Fallback to safe defaults if no valid genres
    queryParams.append('seed_genres', 'pop')
  }
  
  console.log('Genre selection:', {
    original: musicParams.seed_genres,
    normalized: normalizedGenres,
    valid: validSeedGenres,
    final: queryParams.get('seed_genres'),
  })

  // Note: We're only using genres for now. According to Spotify docs, we need at least 1 seed
  // and can have up to 5 total (genres + artists + tracks combined)

  // Add audio feature targets
  if (musicParams.target_energy !== undefined) {
    queryParams.append('target_energy', musicParams.target_energy.toString())
  }
  if (musicParams.target_valence !== undefined) {
    queryParams.append('target_valence', musicParams.target_valence.toString())
  }
  if (musicParams.target_tempo !== undefined) {
    queryParams.append('target_tempo', musicParams.target_tempo.toString())
  }
  if (musicParams.target_danceability !== undefined) {
    queryParams.append('target_danceability', musicParams.target_danceability.toString())
  }
  if (musicParams.target_acousticness !== undefined) {
    queryParams.append('target_acousticness', musicParams.target_acousticness.toString())
  }

  // Set limit (10-100 tracks, default 20)
  const trackLimit = Math.min(Math.max(limit, 10), 100)
  queryParams.append('limit', trackLimit.toString())
  
  // Add market parameter - Recommendations API may require it
  // We'll get the user's country from their profile, but for now use US as default
  // The API route will try to add the market parameter if needed

  // First, verify the access token is valid
  if (!accessToken || accessToken.length < 20) {
    throw new Error('Invalid access token format')
  }

  // Use Search API instead of deprecated Recommendations API
  console.log('Using Search API to find tracks by genre:', {
    genres: validSeedGenres,
    hasToken: !!accessToken,
  })

  try {
    // Use our API route to search for tracks
    const response = await fetch('/api/search-tracks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken,
        genres: validSeedGenres || ['pop'],
        limit: limit,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || response.statusText
      throw new Error(`Search API error: ${response.status} - ${errorMessage}`)
    }

    const data = await response.json()

    if (!data.tracks || data.tracks.length === 0) {
      throw new Error('No tracks found for the specified genres')
    }

    return data.tracks as Track[]
  } catch (error) {
    console.error('Error fetching tracks:', error)
    throw error
  }
}

