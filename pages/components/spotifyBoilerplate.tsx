import Image from 'next/image'

function SpotifyBoilerplate () {
  return (
    <div>
      <h1 className="title-font text-lg font-medium text-gray-900 mb-3">
        <span className="text-green-100"> Weatherify</span>{" "} Recommends
        <Image
          className="lg:h-24 md:h-16 object-cover object-center"
          src="/SpotifyLogo.png"
          alt="Spotify Logo"
          width={96}
          height={96}
        />
      </h1>
      <p className="leading-relaxed mb-3">
        Your Spotify-powered music forecast using your location will be displayed here.
      </p>
    </div>
  )
}

export default SpotifyBoilerplate;
