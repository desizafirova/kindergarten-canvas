import { motion } from 'framer-motion';
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import logo from '@/assets/logo-footer.png';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <a href="#home" className="flex items-center gap-2 mb-4 group">
              <motion.div
                className="flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={logo}
                  alt="ДГ №48 Ран Босилек"
                  className="h-24 w-auto"
                />
              </motion.div>
            </a>
            <p className="font-body text-background/70 max-w-md mb-6">
              Възпитаваме млади умове от 2009 г. Вярваме в силата на играта като
              основа за учене, за да помогнем на всяко дете да открие своя
              уникален потенциал.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  className="w-10 h-10 bg-background/10 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h4 className="font-display font-bold text-lg mb-4">
              Бързи връзки
            </h4>
            <ul className="space-y-2 font-body">
              {['Начало', 'Програми', 'За нас', 'Отзиви', 'Контакти'].map(
                (link, i) => (
                  <motion.li
                    key={link}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
                  >
                    <a
                      href={`#${link.toLowerCase().replace(' ', '')}`}
                      className="text-background/70 hover:text-primary transition-colors inline-block"
                    >
                      <motion.span
                        whileHover={{ x: 5 }}
                        className="inline-block"
                      >
                        {link}
                      </motion.span>
                    </a>
                  </motion.li>
                ),
              )}
            </ul>
          </motion.div>

          {/* Programs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h4 className="font-display font-bold text-lg mb-4">
              Нашите програми
            </h4>
            <ul className="space-y-2 font-body">
              {[
                'Изкуство и занаяти',
                'Музика и движение',
                'Ранна математика',
                'Откриване на природата',
                'Социални умения',
              ].map((program, i) => (
                <motion.li
                  key={program}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                >
                  <a
                    href="#programs"
                    className="text-background/70 hover:text-primary transition-colors inline-block"
                  >
                    <motion.span whileHover={{ x: 5 }} className="inline-block">
                      {program}
                    </motion.span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="pt-8 border-t border-background/20 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p className="font-body text-sm text-background/60">
            © 2024 ДГ №48 „Ран Босилек". Всички права запазени.
          </p>
          <div className="flex gap-6 font-body text-sm text-background/60">
            <a href="#" className="hover:text-background transition-colors">
              Политика за поверителност
            </a>
            <a href="#" className="hover:text-background transition-colors">
              Условия за ползване
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
