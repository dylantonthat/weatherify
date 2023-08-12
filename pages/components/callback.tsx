'use client'
//^ have to say so that the page is read as a client component and rendered on client side, not server
import React, { useEffect, useState } from 'react'
import SpotifyBoilerplate from './spotifyBoilerplate'
import WeatherBoilerplate from './weatherBoilerplate'

const openWeatherMapAPIKey = 'b02d63e500da957b341bd27c9068b802'

//if weatherData.weather[0].description is clear sky, few clouds, mist
const ChillMixID = '37i9dQZF1DX889U0CL85jj'

//if weatherData.weather[0].description is shower rain, rain, thunderstorm
const ChillRainyDayID = '37i9dQZF1EIelivQWnxTte'

//if weatherData.weather[0].description is scattered clouds, broken clouds
const CloudyWeatherID = '5LkCNhKwuKa1niaXnFuzVf'

//if weatherData.weather[0].description is snow
const SnowDayID = '4WCmHOBqKS7pac4s1lW2ZY'

function Callback() {
  //open weather map api variables
  const [city, setCity] = useState<any>({})
  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCity(event.target.value)
  }
  const [weatherData, setWeatherData] = useState<any>({})

  console.log(city)

  //spotify web api variables
  const [accessToken, setAccessToken] = useState('')
  const [playlist, setPlaylist] = useState<any>({})

  //fetching Spotify access token from the server side when application is started
  //and setting it to a State variable
  useEffect(() => {
    fetch('/api/spotify') // Make a request to your API route
      //then return the access token and other relevant information in a JSON object
      //then set the access token so it can be used beyond this fetch method

      .then((result) => result.json())
      .then((data) => setAccessToken(data.access_token))
      .catch((error) => console.error('Error fetching Spotify token:', error))
  }, [])

  //retrieving weather data
  async function getWeatherData() {
    console.log('Button pressed')
    // https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API Key}

    // 1. Query our data based on the location input
    // 2. If the location cannot be found, throw an error
    // 3. Otherwise, save data
    try {
      const serverResponse = await fetch(
        'https://api.openweathermap.org/data/2.5/weather?' +
          'q=' +
          city +
          '&appid=' +
          openWeatherMapAPIKey +
          '&units=imperial'
      )

      const data = await serverResponse.json()
      console.log(data)

      if (data?.cod === '404') {
        throw data
      }

      setWeatherData(data)
      console.log(weatherData)
    } catch (err) {
      console.log(err)
    }
  }

  //retrieving playlist metadata
  async function getPlaylist() {
    try {
      // Check if weatherData is defined and has the expected structure
      if (
        weatherData &&
        weatherData.weather &&
        weatherData.weather.length > 0
      ) {
        console.log('setting playlist')

        // Setting up necessary parameters like our pulled access token and content type, which is again JSON
        var playlistParameters = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + accessToken,
          },
        }

        const weatherDescription = weatherData.weather[0].description

        if (
          weatherDescription.includes('clear sky') ||
          weatherDescription.includes('few clouds') ||
          weatherDescription.includes('mist')
        ) {
          var playlist = await fetch(
            'https://api.spotify.com/v1/playlists/' + ChillMixID,
            playlistParameters
          )
            .then((response) => response.json())
            .then((data) => {
              console.log(data)
              setPlaylist(data)
            })
        } else if (
          weatherDescription.includes('shower rain') ||
          weatherDescription.includes('rain') ||
          weatherDescription.includes('thunderstorm')
        ) {
          var playlist = await fetch(
            'https://api.spotify.com/v1/playlists/' + ChillRainyDayID,
            playlistParameters
          )
            .then((response) => response.json())
            .then((data) => {
              console.log(data)
              setPlaylist(data)
            })
        } else if (
          weatherDescription.includes('scattered clouds') ||
          weatherDescription.includes('broken clouds') ||
          weatherDescription.includes('overcast clouds')
        ) {
          var playlist = await fetch(
            'https://api.spotify.com/v1/playlists/' + CloudyWeatherID,
            playlistParameters
          )
            .then((response) => response.json())
            .then((data) => {
              console.log(data)
              setPlaylist(data)
            })
        } else {
          var playlist = await fetch(
            'https://api.spotify.com/v1/playlists/' + SnowDayID,
            playlistParameters
          )
            .then((response) => response.json())
            .then((data) => {
              console.log(data)
              setPlaylist(data)
            })
        }
      } else {
        console.log('weatherData is not defined or has an unexpected structure')
      }
    } catch (err) {
      console.log(err)
    }
  }

  //checking if the weather was extracted; if it is, then we can get the corresponding playlist data
  useEffect(() => {
    if (weatherData.weather) {
      getPlaylist() // Call getPlaylist when weatherData state has been updated
    }
  }, [weatherData])

  return (
    <div>
      <section className="text-gray-600 body-font">
        {/* search bar with functionality */}
        <div className="flex mt-1">
          <div
            className="mx-auto mb-1 container px-4 items-center justify-center lg: w-3/4 px-0 flex flex-col
            md:flex-row items-stretch"
          >
            <input
              type="search"
              className="w-full md:w-[1px] rounded flex-auto md:rounded-l border border-solid border-neutral-300 px-3 py-2 md:py-[0.25rem] text-base font-normal leading-[1.6] ease-in-out focus:z-[3] focus:border-primary"
              placeholder="Enter City (e.g. New York City, Dubai)"
              aria-label="Search"
              onChange={handleCityChange}
            />

            <button
              className="text-white rounded mt-2 md:mt-0 ml-0 md:ml-1 relative z-[2] py-2 md:rounded-r px-4 md:px-6 text-base md:text-m bg-green-100 transition duration-200 ease-in-out hover:bg-green-200"
              type="button"
              onClick={() => {
                getWeatherData()
              }}
            >
              SEARCH CITY
            </button>
          </div>
        </div>

        {/*output boxes to display Weather Reports and Playlist Recommendations*/}
        <div className="container px-5 py-5 mx-auto ">
          <div className="flex flex-wrap justify-center">
            <div className="p-2 md:w-2/5">
              <div className="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden">
                <div className="p-6">
                  {Object.keys(weatherData).length !== 0 ? (
                    <div>
                      <h1 className="title-font text-lg font-medium text-gray-900 mb-3">
                        Weather <span className="text-green-100"> Report</span>
                        <img
                          className="lg:h-24 md:h-16 object-cover object-center"
                          src={
                            'https://openweathermap.org/img/wn/' +
                            weatherData.weather[0].icon +
                            '@2x.png'
                          }
                          alt="Weather Logo"
                          width="100"
                          height="100"
                        ></img>
                      </h1>

                      {/*Weather Report Description*/}
                      <p className="leading-relaxed mb-3">
                        It currently feels like {weatherData.main.feels_like}ºF
                        in {weatherData.name}, with a dash of{' '}
                        {weatherData.weather[0].main} on top.
                      </p>
                    </div>
                  ) : (
                    <WeatherBoilerplate/>
                  )}
                </div>
              </div>
            </div>

            <div className="p-2 md:w-2/5">
              <div className="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden">
                <div className="p-6">
                  {Object.keys(playlist).length !== 0 ? (
                    <div>
                      <h1 className="title-font text-lg font-medium text-gray-900 mb-3">
                        <span className="text-green-100"> Weatherify</span>{' '}
                        Recommends
                        <img
                          className="lg:h-24 md:h-16 object-cover object-center rounded-lg"
                          src={playlist.images[0].url}
                          alt="Spotify Album"
                          width="100"
                          height="100"
                        ></img>
                      </h1>

                      {/*Spotify Recommendation Description*/}
                      <p className="leading-relaxed mb-3">
                        In order to sychronize yourself with your environment,
                        we recommend:
                        <br></br>
                        <span className="text-green-100 font-bold">
                          {playlist.name}
                        </span>
                      </p>
                      <div className="flex items-center flex-wrap ">
                        <a
                          className="text-indigo-500 inline-flex items-center md:mb-2 lg:mb-0 hover:underline transition duration-200"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={playlist.external_urls.spotify}
                        >
                          Listen on Spotify
                          <svg
                            className="w-4 h-4 ml-2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M5 12h14"></path>
                            <path d="M12 5l7 7-7 7"></path>
                          </svg>
                        </a>
                        <span className="text-gray-400 mr-3 inline-flex items-center lg:ml-auto md:ml-0 ml-auto leading-none text-sm pr-3 py-1 border-r-2 border-gray-200">
                          {playlist.tracks.items.length} tracks
                        </span>
                        <span className="text-gray-400 inline-flex items-center leading-none text-sm">
                          {playlist.description}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <SpotifyBoilerplate/>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Callback
