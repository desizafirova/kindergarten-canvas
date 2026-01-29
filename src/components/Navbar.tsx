import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import logo from '@/assets/logo-header.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const navLinks = [
    { name: 'Начало', href: isHomePage ? '#home' : '/', isRoute: !isHomePage },
    {
      name: 'Програми',
      href: isHomePage ? '#programs' : '/#programs',
      isRoute: !isHomePage,
    },
    { name: 'Групи', href: '/groups', isRoute: true },
    { name: 'График', href: '/daily-schedule', isRoute: true },
    { name: 'Меню', href: '/menu', isRoute: true },
    { name: 'Документи', href: '/documents', isRoute: true },
    { name: 'Прием', href: '/admission', isRoute: true },
    { name: 'Кариери', href: '/careers', isRoute: true },
    { name: 'Новини', href: '/news', isRoute: true },
    {
      name: 'Контакти',
      href: isHomePage ? '#contact' : '/#contact',
      isRoute: !isHomePage,
    },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          {/* Hamburger Menu - Left */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <motion.button
                className="p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                whileTap={{ scale: 0.95 }}
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </motion.button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center">
                  <span className="font-display font-bold">Навигация</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-6">
                {navLinks.map((link, i) =>
                  link.isRoute ? (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                      <Link
                        to={link.href}
                        className="block font-body font-medium text-foreground/80 hover:text-accent hover:bg-muted transition-colors px-3 py-3 rounded-lg"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      className="block font-body font-medium text-foreground/80 hover:text-accent hover:bg-muted transition-colors px-3 py-3 rounded-lg"
                      onClick={() => setIsOpen(false)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                      {link.name}
                    </motion.a>
                  ),
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="mt-4 px-3"
                >
                  <Button variant="playful" size="lg" className="w-full">
                    Enroll Now
                  </Button>
                </motion.div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo - Center */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <motion.div
              className="flex items-center justify-center gap-2 group"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={logo}
                alt="ДГ №48 Ран Босилек"
                className="h-20 w-full"
              />
            </motion.div>
          </Link>

          {/* CTA Button - Right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Button variant="playful" size="lg" className="hidden sm:flex">
              Кандидатстване
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
