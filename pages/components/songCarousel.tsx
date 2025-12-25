'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Track } from '../../lib/spotifyRecommendations'

interface SongCarouselProps {
  tracks: Track[]
}

function SongCarousel({ tracks }: SongCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoRotate, setAutoRotate] = useState(true)

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (!autoRotate || !tracks || tracks.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % tracks.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRotate, tracks])

  // Early return if tracks is undefined or empty (after hooks)
  if (!tracks || tracks.length === 0) {
    return null
  }

  const currentTrack = tracks[currentIndex]
  const albumImage = currentTrack.album.images[0]?.url || '/SpotifyLogo.png'
  const artistNames = currentTrack.artists.map((artist) => artist.name).join(', ')

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + tracks.length) % tracks.length)
    setAutoRotate(false) // Pause auto-rotate when user manually navigates
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % tracks.length)
    setAutoRotate(false) // Pause auto-rotate when user manually navigates
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full sm:w-[500px]">
      <div className="h-full bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300">
        <div className="p-5 min-h-[280px] flex flex-col">
          <h2 className="title-font text-lg font-semibold text-gray-800 mb-4 text-center">
            <span className="text-green-100">Weatherify</span> Recommends
          </h2>

          <div className="flex flex-col items-center justify-center">
            {/* Album Art */}
            <div className="mb-4">
              <div className="relative group">
                <Image
                  className="w-32 h-32 object-cover rounded-xl shadow-xl transform group-hover:scale-105 transition-transform duration-300"
                  src={albumImage}
                  alt={currentTrack.album.name}
                  width={128}
                  height={128}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Track Information */}
            <div className="text-center w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                {currentTrack.name}
              </h3>
              <p className="text-base text-gray-700 mb-1 font-medium">{artistNames}</p>
              <p className="text-xs text-gray-600 mb-2">{currentTrack.album.name}</p>
              <p className="text-xs text-gray-500 font-medium mb-3">
                {formatDuration(currentTrack.duration_ms)}
              </p>

              {/* Carousel Navigation */}
              <div className="flex items-center justify-center gap-4 mb-3">
                <button
                  onClick={goToPrevious}
                  className="text-gray-800 hover:text-black transition duration-200 p-2 rounded-full bg-white/80 hover:bg-white shadow-md hover:shadow-lg"
                  aria-label="Previous track"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <span className="text-gray-600 text-xs font-semibold bg-white/60 px-2.5 py-1 rounded-full">
                  {currentIndex + 1} / {tracks.length}
                </span>

                <button
                  onClick={goToNext}
                  className="text-gray-800 hover:text-black transition duration-200 p-2 rounded-full bg-white/80 hover:bg-white shadow-md hover:shadow-lg"
                  aria-label="Next track"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Spotify Link */}
              <a
                className="inline-flex items-center justify-center w-full py-2 px-4 text-white bg-green-100 rounded-full hover:bg-green-200 transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-xs"
                target="_blank"
                rel="noopener noreferrer"
                href={currentTrack.external_urls.spotify}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                Listen on Spotify
              </a>
            </div>
          </div>

          {/* Auto-rotate indicator */}
          {tracks.length > 1 && (
            <div className="text-center mt-3">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className="inline-flex items-center justify-center w-full py-2 px-4 text-white hover:bg-gray-800 rounded-full transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-xs"
                style={{ backgroundColor: '#000000' }}
              >
                {autoRotate ? 'Pause rotation' : 'Resume rotation'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SongCarousel

// Prevent this file from being statically generated as a page
export async function getStaticProps() {
  return {
    notFound: true,
  }
}

