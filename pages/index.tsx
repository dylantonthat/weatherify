import type { NextPage } from 'next'
import { signIn, signOut, useSession } from 'next-auth/react'
import Head from 'next/head'
import Callback from './components/callback'
import Footer from './components/footer'
import Navbar from './components/navbar'


//homepage
const Home: NextPage = () => {
  const session = useSession()
  console.log(session)


  return (
    <div>
      <Head>
        <title>Weatherify</title>
        <meta name="description" content="Spotify-Powered Music Forecasting" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {/*navbar component*/}
        <Navbar/>
        <section className="text-center w-full">
          <div className="container mx-auto flex px-5 py-10 items-center justify-center flex-col">
            <div className="text-center lg:w-2/3 w-full">
              <h1 className='title-font sm:text-7xl text-5xl mb-3 font-medium text-green-100'>
                {session.status === 'authenticated'
                  ? `Welcome to Weatherify,  ${session.data.user?.name || 'friend'}`
                  : 'Weatherify'}
              </h1>
              <p className="mt-5 mb-2 leading-relaxed sm:text-2xl text-l">
                Spotify-Powered Music Forecasting
              </p>
            </div>
          </div>
        </section>
        
        {/*button functionality*/}
        <p>
        {session.status === 'authenticated' ? (
          <Callback/>
          ) : (
            <br></br>
          )}
          
          {session.status === 'authenticated' ? (
            <button
              className="mb-5 flex mx-auto text-white bg-green-100 border-0 py-2 px-8 focus:outline-none transition duration-200 ease-in-out hover:bg-green-200 rounded-full text-lg"
              type="button"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          ) : (
            <button
              className="mb-5 flex mx-auto text-white bg-green-100 border-0 py-2 px-8 focus:outline-none transition duration-200 ease-in-out hover:bg-green-200 rounded-full text-lg"
              type="button"
              onClick={() => signIn('spotify')}
              disabled={session.status === 'loading'}
            >
              Log in with Spotify
            </button>
          )}
        </p>
      </main>
      
      {/*footer component*/}
      <Footer/>
    </div>
  )
}

export default Home
