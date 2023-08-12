import Contact from "./components/contact";
import Footer from "./components/footer";
import Navbar from "./components/navbar";

export default function Home() {
  return (
    <main>
      <Navbar/>
      <Contact/>
      <Footer/>
    </main>
  );
}