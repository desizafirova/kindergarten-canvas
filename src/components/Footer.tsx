import { Star, Facebook, Instagram, Youtube, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <a href="#home" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-background">
                Little Stars
              </span>
            </a>
            <p className="font-body text-background/70 max-w-md mb-6">
              Nurturing young minds since 2009. We believe in the power of play-based 
              learning to help every child discover their unique potential.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 bg-background/10 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 font-body">
              {["Home", "Programs", "About Us", "Testimonials", "Contact"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(" ", "")}`}
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Our Programs</h4>
            <ul className="space-y-2 font-body">
              {["Arts & Crafts", "Music & Movement", "Early Math", "Nature Discovery", "Social Skills"].map((program) => (
                <li key={program}>
                  <a
                    href="#programs"
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    {program}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-background/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-sm text-background/60">
            © 2024 Little Stars Kindergarten. All rights reserved.
          </p>
          <div className="flex gap-6 font-body text-sm text-background/60">
            <a href="#" className="hover:text-background transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-background transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
