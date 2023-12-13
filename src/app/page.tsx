"use client"
import { SessionProvider } from "next-auth/react";

import Callback from "@/components/callback";
import Footer from "@/components/footer";
import Home from "@/components/home";
import Navbar from "@/components/navbar";



import { useSession } from "next-auth/react";


// Home Page
export default function Page() {

  const { data: session } = useSession()

  // if the user is signed in with their spotify, they will be shown the CallBack component
  if (session)
  {
    return (
      <SessionProvider>
        <main>
          <Navbar/>
          <Callback/>
          <Footer/>
        </main>
      </SessionProvider>
      
    )
  }

  // otherwise, they will still be prompted to log in
  else
  {
    return (
      <main>
        <Navbar/>
        <Home/>
        <Footer/>
      </main>
    )
  }
}






