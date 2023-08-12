function Navbar() {
  return (
    <header className="text-gray-600 body-font">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <nav className="md:ml-auto md:mr-auto flex flex-wrap items-center text-base justify-center">
          <a className="mr-5 hover:text-green-100 transition ease-in-out duration-200" href="/">Home</a>
          <a className="mr-5 hover:text-green-100 transition ease-in-out duration-200" href="/about">About</a>
          <a className="mr-5 hover:text-green-100 transition ease-in-out duration-200" href="/contact">Contact</a>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
