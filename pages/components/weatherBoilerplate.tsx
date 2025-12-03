import Image from 'next/image'

function WeatherBoilerplate () {
  return (
    <div>
      <h1 className="title-font text-lg font-medium text-gray-900 mb-3">
        Weather <span className="text-green-100"> Report</span>
        <Image
          className="lg:h-24 md:h-16 object-cover object-center"
          src="https://wehco.media.clients.ellingtoncms.com/imports/adg/photos/203811660_partly-mostly-cloudy-clouds_t800.jpg?90232451fbcadccc64a17de7521d859a8f88077d"
          alt="Weather Logo"
          width={100}
          height={100}
        />
      </h1>
      <p className="leading-relaxed mb-3">
        The weather information of the location that you searched will be displayed here.
      </p>
    </div>
  )
}

export default WeatherBoilerplate;
