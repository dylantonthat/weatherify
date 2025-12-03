'use client'
//^ have to say so that the page is read as a client component and rendered on client side, not server
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { getRecommendedSongs, Track } from '../../lib/spotifyRecommendations'
import SongCarousel from './songCarousel'

const openWeatherMapAPIKey = 'b02d63e500da957b341bd27c9068b802'

function Callback() {
  const { data: session } = useSession()
  
  // Weather and location state
  const [weatherData, setWeatherData] = useState<any>({})
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)

  // Spotify recommendations state
  const [recommendedTracks, setRecommendedTracks] = useState<Track[]>([])
  const [isLoadingTracks, setIsLoadingTracks] = useState(false)
  const [tracksError, setTracksError] = useState<string | null>(null)

  // Get user's location using geolocation API
  const getUserLocation = useCallback(() => {
    setIsLoadingLocation(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      setIsLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lon: longitude })
        setIsLoadingLocation(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        setLocationError('Unable to retrieve your location. Please allow location access.')
        setIsLoadingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [])

  // Get weather data based on coordinates
  const getWeatherDataFromCoords = useCallback(async (lat: number, lon: number) => {
    setIsLoadingWeather(true)
    try {
      const serverResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherMapAPIKey}&units=imperial`
      )

      const data = await serverResponse.json()
      console.log('Weather data:', data)

      if (data?.cod === '404' || data?.cod === '400') {
        throw new Error(data.message || 'Weather data not found')
      }

      setWeatherData(data)
      setIsLoadingWeather(false)
    } catch (err: any) {
      console.error('Weather fetch error:', err)
      setLocationError(err.message || 'Failed to fetch weather data')
      setIsLoadingWeather(false)
    }
  }, [])

  // Fetch weather when location is available
  useEffect(() => {
    if (location) {
      getWeatherDataFromCoords(location.lat, location.lon)
    }
  }, [location, getWeatherDataFromCoords])

  // Retrieving recommended tracks based on weather using user's session token
  const getRecommendedSongsFromWeather = useCallback(async () => {
    try {
      // Get access token from session
      const userAccessToken = (session as any)?.accessToken
      
      console.log('Session check:', {
        hasSession: !!session,
        hasAccessToken: !!userAccessToken,
        tokenLength: userAccessToken?.length,
        tokenPreview: userAccessToken ? `${userAccessToken.substring(0, 20)}...` : 'none',
      })
      
      // Check if weatherData is defined and has the expected structure
      if (
        weatherData &&
        weatherData.weather &&
        weatherData.weather.length > 0 &&
        userAccessToken
      ) {
        console.log('Fetching recommended tracks based on weather')
        setIsLoadingTracks(true)
        setTracksError(null)

        // Get recommended tracks using the new recommendations API
        const tracks = await getRecommendedSongs(userAccessToken, weatherData, 15)
        console.log('Received recommended tracks:', tracks)
        setRecommendedTracks(tracks)
        setIsLoadingTracks(false)
      } else {
        if (!userAccessToken) {
          console.log('User access token not available yet')
          setTracksError('Please sign in with Spotify to get recommendations')
        } else {
          console.log('weatherData is not defined or has an unexpected structure')
        }
      }
    } catch (err: any) {
      console.error('Error fetching recommended tracks:', err)
      setTracksError(err.message || 'Failed to fetch recommended tracks')
      setIsLoadingTracks(false)
      setRecommendedTracks([])
    }
  }, [weatherData, session])

  // Get recommended tracks when weather data and session are available
  useEffect(() => {
    if (weatherData.weather && session) {
      getRecommendedSongsFromWeather()
    }
  }, [weatherData, session, getRecommendedSongsFromWeather])

  // Show initial state - just the location button
  if (!location && !isLoadingLocation && !locationError) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <button
            className="text-white rounded-full py-4 px-12 text-lg bg-green-100 transition duration-200 ease-in-out hover:bg-green-200 shadow-lg hover:shadow-xl"
            type="button"
            onClick={getUserLocation}
          >
            Get My Location
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <section className="text-gray-600 body-font">
        {/* Status messages */}
        {isLoadingLocation && (
          <div className="text-center py-2">
            <p className="text-gray-600">Getting your location...</p>
          </div>
        )}
        {locationError && (
          <div className="text-center py-2">
            <p className="text-red-500">{locationError}</p>
            <button
              className="mt-2 text-white rounded py-2 px-6 bg-green-100 hover:bg-green-200 transition duration-200"
              onClick={getUserLocation}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Horizontal Carousel - Weather and Songs */}
        {(Object.keys(weatherData).length > 0 || isLoadingWeather || isLoadingTracks) && (
          <div className="w-full py-4">
            <div className="flex flex-wrap justify-center gap-6 px-4 max-w-7xl mx-auto">
              {/* Weather Card */}
              <div className="w-full sm:w-[500px]">
                <div className="h-full bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                  <div className="p-5 min-h-[280px] flex flex-col">
                    {isLoadingWeather ? (
                      <div className="text-center">
                        <h2 className="title-font text-lg font-semibold text-gray-800 mb-4">
                          Weather <span className="text-green-100">Report</span>
                        </h2>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-100 mx-auto mb-2"></div>
                        <p className="text-gray-600 text-sm">Loading weather data...</p>
                      </div>
                    ) : Object.keys(weatherData).length !== 0 ? (
                      <>
                        <h2 className="title-font text-lg font-semibold text-gray-800 mb-4 text-center">
                          Weather <span className="text-green-100">Report</span>
                        </h2>
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-4">
                            <div className="bg-white rounded-full p-2 shadow-lg">
                              <Image
                                className="w-20 h-20 object-cover"
                                src={
                                  'https://openweathermap.org/img/wn/' +
                                  weatherData.weather[0].icon +
                                  '@2x.png'
                                }
                                alt="Weather Icon"
                                width={80}
                                height={80}
                              />
                            </div>
                          </div>
                          <div className="text-center w-full">
                            <p className="text-3xl font-bold text-gray-900 mb-1">
                              {Math.round(weatherData.main.temp)}ºF
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              Feels like {Math.round(weatherData.main.feels_like)}ºF
                            </p>
                            <p className="text-lg text-gray-800 mb-2 font-semibold">
                              {weatherData.name}
                            </p>
                            <p className="text-gray-600 capitalize text-base font-medium mb-4">
                              {weatherData.weather[0].description}
                            </p>
                            
                            {/* Additional Weather Info */}
                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-300">
                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1">High / Low</p>
                                <p className="text-sm font-semibold text-gray-800">
                                  {Math.round(weatherData.main.temp_max)}º / {Math.round(weatherData.main.temp_min)}º
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1">Humidity</p>
                                <p className="text-sm font-semibold text-gray-800">
                                  {weatherData.main.humidity}%
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1">Wind Speed</p>
                                <p className="text-sm font-semibold text-gray-800">
                                  {Math.round(weatherData.wind?.speed || 0)} mph
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1">Pressure</p>
                                <p className="text-sm font-semibold text-gray-800">
                                  {weatherData.main.pressure} hPa
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Songs Carousel */}
              {isLoadingTracks ? (
                <div className="w-full sm:w-[500px]">
                  <div className="h-full bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-5 text-center min-h-[280px] flex flex-col justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-100 mx-auto mb-2"></div>
                      <h2 className="title-font text-lg font-semibold text-gray-800 mb-1">
                        <span className="text-green-100">Weatherify</span> Recommends
                      </h2>
                      <p className="text-gray-600 text-sm">Finding the perfect songs...</p>
                    </div>
                  </div>
                </div>
              ) : tracksError ? (
                <div className="w-full sm:w-[500px]">
                  <div className="h-full bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-5 text-center min-h-[280px] flex flex-col justify-center">
                      <h2 className="title-font text-lg font-semibold text-gray-800 mb-2">
                        <span className="text-green-100">Weatherify</span> Recommends
                      </h2>
                      <p className="text-red-600 font-medium text-sm">{tracksError}</p>
                    </div>
                  </div>
                </div>
              ) : recommendedTracks.length > 0 ? (
                <SongCarousel tracks={recommendedTracks} />
              ) : null}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default Callback
