function Footer() {
  return (
    <div>
      <hr className="w-48 h-1.5 mx-auto my-4 bg-green-100 border-0 rounded md:my-10 dark:bg-gray-700"></hr>
      <footer className="sticky bottom-0 block text-sm text-gray-500 text-center dark:text-gray-400">
        <a
          className="hover:underline"
          href="https://www.dylantonthat.com/"
          target="_blank"
          rel="noreferrer"
        >
          Dylan Ton-That
        </a>{" "}
        © 2023
      </footer>
    </div>
  );
}

export default Footer;
