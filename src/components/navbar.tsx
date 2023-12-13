import Link from 'next/link';

function Navbar() {
  return (
    <header className="text-gray-500 body-font">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <nav className="flex lg:w-1/5 flex-wrap items-center text-base md:ml-auto">
          <Link className="mr-5 hover:text-green-100 transition duration-300 ease-in-out" href="/">
            Home
          </Link>
          <Link className="mr-5 hover:text-green-100 transition duration-300 ease-in-out" href="/about">
            About
          </Link>
          <Link className="hover:text-green-100 transition duration-300 ease-in-out" href="/contact">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
