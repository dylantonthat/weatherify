import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import '../styles/globals.css'

type AppPropsWithSession = AppProps & {
  pageProps: {
    session?: Session
  }
}

function App({ Component, pageProps }: AppPropsWithSession) {
  return (
    <SessionProvider 
      session={pageProps.session}
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default App
