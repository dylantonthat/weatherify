function Contact() {
  return (
    <div>
      <section className="text-gray-600 body-font">
        <div className="container px-5 py-24 mx-auto">
          <div className="text-center mb-20">
            <h1 className="sm:text-3xl text-2xl font-medium text-center title-font text-gray-900 mb-4">
              Contact <span className="text-green-100">Me</span>
            </h1>
            <p className="text-base leading-relaxed xl:w-2/4 lg:w-3/4 mx-auto">
              If you have any comments or concerns, please feel free to contact
              me at
              <a
                className="text-green-100 hover:text-green-200 transition duration-200"
                href="mailto:dkt5@njit.edu? subject=Weatherify"
              >
                {" "}
                dkt5@njit.edu
              </a>
              ! You can also check out my portfolio website and my other
              projects
              <a
                className="text-green-100 hover:text-green-200 transition duration-200"
                href="https://www.dylantonthat.com"
                target="_blank"
                rel="noreferrer"
              >
                {" "}
                here.
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
