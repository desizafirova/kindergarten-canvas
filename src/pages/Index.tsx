import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Programs from "@/components/Programs";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Teachers from "@/components/Teachers";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <main>
        <Hero />
        <Programs />
        <About />
        <Gallery />
        <Teachers />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
