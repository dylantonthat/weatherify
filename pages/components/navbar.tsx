'use client'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

function Navbar() {
  const session = useSession()

  return (
    <header className="text-gray-600 body-font">
      <div className="container mx-auto flex flex-wrap py-5 px-5 mb-4 flex-col md:flex-row items-center relative">
        <div className="flex-1 hidden md:block"></div>
        <nav className="flex flex-wrap items-center text-base justify-center gap-6">
          <Link className="hover:text-green-100 transition ease-in-out duration-200" href="/">Home</Link>
          <Link className="hover:text-green-100 transition ease-in-out duration-200" href="/about">About</Link>
          <Link className="hover:text-green-100 transition ease-in-out duration-200" href="/contact">Contact</Link>
        </nav>
        <div className="flex-1 flex justify-end">
          {session.status === 'authenticated' && (
            <button
              className="text-white bg-green-100 border-0 py-2 px-6 focus:outline-none transition duration-200 ease-in-out hover:bg-green-200 rounded-full text-sm font-semibold"
              type="button"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
