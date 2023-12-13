"use client";
//^ have to say so that the page is read as a client component and rendered on client side, not server
import WeatherBoilerplate from "@/components/weatherBoilerplate";

import { NextPage } from "next";
import React, { useState } from "react";


const openWeatherMapAPIKey = "b02d63e500da957b341bd27c9068b802";

const Callback: NextPage = () => {
  const [city, setCity] = useState<any>({});
  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCity(event.target.value);
  };

  console.log(city);

  const [weatherData, setWeatherData] = useState<any>({});

  //asynchronous function
  async function getWeatherData() {
    console.log("Button pressed");
    // https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API Key}

    // 1. Query our data based on the location input
    // 2. If the location cannot be found, throw an error
    // 3. Otherwise, save data

    try
    {
      const serverResponse = await fetch(
        "https://api.openweathermap.org/data/2.5/weather?" +
          "q=" +
          city +
          "&appid=" +
          openWeatherMapAPIKey +
          "&units=imperial"
      );

      const data = await serverResponse.json();
      console.log(data);
      if (data?.cod === "404")
      { throw data; }
      setWeatherData(data);
    }
    catch (err)
    { console.log(err); }
  }

  return (
    <div>
      <section className="text-gray-600 body-font">
        <div className="container mx-auto flex px-5 py-10 items-center justify-center flex-col">
          <div className="text-center lg:w-2/3 w-full">
            <h1 className="title-font sm:text-7xl text-5xl mb-3 font-medium">
              Welcome to  <span className="text-green-100"> Weatherify </span>
            </h1>
          </div>
        </div>

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
              className="rounded mt-2 md:mt-0 ml-0 md:ml-1 relative z-[2] py-2 md:rounded-r px-4 md:px-6 text-base md:text-m bg-green-100 text-white transition duration-200 ease-in-out hover:bg-green-200"
              type="button"
              onClick={getWeatherData}
            >
              SEARCH CITY
            </button>
          </div>
        </div>
        

        {/*output padding boxes*/}
        <div className="container px-5 py-5 mx-auto ">
          <div className="flex flex-wrap justify-center">
            <div className="p-2 md:w-2/5">
              <div className="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden">
                <div className="p-6">
                  {Object.keys(weatherData).length !== 0 ?
                    <>
                      <h1 className="title-font text-lg font-medium text-gray-900 mb-3">
                        Weather <span className="text-green-100"> Report</span>
                        <img
                          className="lg:h-24 md:h-16 object-cover object-center"
                          src={"https://openweathermap.org/img/wn/" + weatherData.weather[0].icon + "@2x.png"}
                          alt="Weather Logo"
                          width = "100"
                          height = "100"
                        ></img>
                      </h1>
                      <p className="leading-relaxed mb-3">
                        It currently feels like {weatherData.main.feels_like}ºF in {weatherData.name},
                        with a dash of {weatherData.weather[0].main} on top.
                      </p>
                    </>
                    :<WeatherBoilerplate/>
                  }
                  
                </div>
              </div>
            </div>

            
            <div className="p-2 md:w-2/5">
              <div className="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden">
                <div className="p-6">
                  <h1 className="title-font text-lg font-medium text-gray-900 mb-3">
                    <span className="text-green-100"> Spotify</span>{" "} Recommends
                    <img
                      className="lg:h-24 md:h-16 object-cover object-center"
                      src="/SpotifyLogo.png"
                      alt="Spotify Logo"
                      width = "100"
                      height = "100"
                    ></img>
                  </h1>
                  <p className="leading-relaxed mb-3">
                    Your Spotify-powered music forecast using your location will be displayed here.
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
};

export default Callback;
