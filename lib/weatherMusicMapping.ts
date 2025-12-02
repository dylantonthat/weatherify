// Weather to music parameter mappings for Spotify Recommendations API

export interface WeatherMusicParams {
  seed_genres: string[]
  seed_artists?: string[] // Optional artist IDs
  target_energy?: number // 0.0 to 1.0
  target_valence?: number // 0.0 to 1.0 (positivity)
  target_tempo?: number // BPM
  target_danceability?: number // 0.0 to 1.0
  target_acousticness?: number // 0.0 to 1.0
}

// Popular artist IDs for different moods (can be expanded)
const ARTISTS = {
  sunny: ['4Z8W4fKeB5YxbusRsdQVPb', '06HL4z0CvFAxyc27GXpf02'], // Radiohead, Taylor Swift
  rainy: ['4Z8W4fKeB5YxbusRsdQVPb', '1Xyo4u8uXC1ZmMpatF05PJ'], // Radiohead, The Weeknd
  cloudy: ['4Z8W4fKeB5YxbusRsdQVPb', '1uNFoZAHBGtllmzznpCI3s'], // Radiohead, Justin Bieber
  snowy: ['4Z8W4fKeB5YxbusRsdQVPb', '1McMsnEElThX1knmY4oliG'], // Radiohead, Olivia Rodrigo
}

/**
 * Get music parameters based on weather description and temperature
 */
export function getWeatherMusicParams(
  weatherDescription: string,
  temperature?: number
): WeatherMusicParams {
  const description = weatherDescription.toLowerCase()

  // Clear sky / Sunny weather - upbeat, high energy, positive
  if (
    description.includes('clear sky') ||
    description.includes('sunny') ||
    description.includes('few clouds')
  ) {
    return {
      seed_genres: ['pop', 'indie-pop', 'dance'],
      seed_artists: ARTISTS.sunny,
      target_energy: 0.7,
      target_valence: 0.8, // Very positive
      target_danceability: 0.7,
      target_tempo: temperature && temperature > 75 ? 130 : 120, // Faster if hot
    }
  }

  // Rain / Thunderstorm - calm, introspective, lower energy
  if (
    description.includes('rain') ||
    description.includes('shower') ||
    description.includes('thunderstorm') ||
    description.includes('drizzle')
  ) {
    return {
      seed_genres: ['chill', 'indie', 'acoustic'],
      seed_artists: ARTISTS.rainy,
      target_energy: 0.3,
      target_valence: 0.4, // More introspective
      target_acousticness: 0.6,
      target_tempo: 90,
    }
  }

  // Cloudy / Overcast - moderate energy, neutral mood
  if (
    description.includes('clouds') ||
    description.includes('overcast') ||
    description.includes('scattered') ||
    description.includes('broken')
  ) {
    return {
      seed_genres: ['indie', 'alternative', 'indie-pop'],
      seed_artists: ARTISTS.cloudy,
      target_energy: 0.5,
      target_valence: 0.6, // Neutral-positive
      target_tempo: 110,
    }
  }

  // Snow - cozy, warm, acoustic
  if (description.includes('snow') || description.includes('sleet')) {
    return {
      seed_genres: ['acoustic', 'indie', 'singer-songwriter'],
      seed_artists: ARTISTS.snowy,
      target_energy: 0.4,
      target_valence: 0.6,
      target_acousticness: 0.7,
      target_tempo: 100,
    }
  }

  // Mist / Fog - ambient, atmospheric
  if (description.includes('mist') || description.includes('fog')) {
    return {
      seed_genres: ['ambient', 'chill', 'indie'],
      target_energy: 0.3,
      target_valence: 0.5,
      target_acousticness: 0.5,
      target_tempo: 85,
    }
  }

  // Extreme weather (high winds, etc.) - intense, energetic
  if (
    description.includes('extreme') ||
    description.includes('tornado') ||
    description.includes('hurricane')
  ) {
    return {
      seed_genres: ['rock', 'electronic', 'alternative'],
      target_energy: 0.9,
      target_valence: 0.5,
      target_tempo: 140,
    }
  }

  // Default fallback - balanced, moderate
  return {
    seed_genres: ['pop', 'indie', 'alternative'],
    target_energy: 0.5,
    target_valence: 0.6,
    target_tempo: 110,
  }
}

/**
 * Adjust parameters based on temperature
 */
export function adjustForTemperature(
  params: WeatherMusicParams,
  temperature: number
): WeatherMusicParams {
  // Very hot (>85°F) - increase energy and tempo
  if (temperature > 85) {
    return {
      ...params,
      target_energy: Math.min(0.9, (params.target_energy || 0.5) + 0.2),
      target_tempo: (params.target_tempo || 110) + 20,
      target_danceability: Math.min(0.9, (params.target_danceability || 0.5) + 0.2),
    }
  }

  // Very cold (<32°F) - decrease energy, increase acousticness
  if (temperature < 32) {
    return {
      ...params,
      target_energy: Math.max(0.2, (params.target_energy || 0.5) - 0.2),
      target_tempo: Math.max(70, (params.target_tempo || 110) - 20),
      target_acousticness: Math.min(0.9, (params.target_acousticness || 0.3) + 0.3),
    }
  }

  return params
}

