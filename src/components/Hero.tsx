import { motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, BookOpen } from 'lucide-react';
import heroImage from '@/assets/hero-illustration.jpeg';

const blobVariants: Variants = {
  animate: {
    borderRadius: [
      '60% 40% 30% 70% / 60% 30% 70% 40%',
      '30% 60% 70% 40% / 50% 60% 30% 60%',
      '60% 40% 30% 70% / 60% 30% 70% 40%',
    ],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen pt-20 overflow-hidden">
      {/* Decorative Blobs */}
      <motion.div
        className="absolute top-32 left-10 w-32 h-32 bg-primary/30"
        initial={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
        animate={{
          borderRadius: [
            '60% 40% 30% 70% / 60% 30% 70% 40%',
            '30% 60% 70% 40% / 50% 60% 30% 60%',
            '60% 40% 30% 70% / 60% 30% 70% 40%',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-48 right-20 w-24 h-24 bg-secondary/30"
        initial={{ borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' }}
        animate={{
          borderRadius: [
            '30% 60% 70% 40% / 50% 60% 30% 60%',
            '60% 40% 30% 70% / 60% 30% 70% 40%',
            '30% 60% 70% 40% / 50% 60% 30% 60%',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
      <motion.div
        className="absolute bottom-32 left-1/4 w-20 h-20 bg-accent/30"
        initial={{ borderRadius: '40% 60% 30% 70% / 40% 50% 60% 50%' }}
        animate={{
          borderRadius: [
            '40% 60% 30% 70% / 40% 50% 60% 50%',
            '60% 40% 70% 30% / 50% 40% 50% 60%',
            '40% 60% 30% 70% / 40% 50% 60% 50%',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
      />
      <motion.div
        className="absolute bottom-48 right-1/3 w-16 h-16 bg-mint/30"
        initial={{ borderRadius: '50% 50% 30% 70% / 50% 40% 60% 50%' }}
        animate={{
          borderRadius: [
            '50% 50% 30% 70% / 50% 40% 60% 50%',
            '30% 70% 50% 50% / 40% 60% 40% 60%',
            '50% 50% 30% 70% / 50% 40% 60% 50%',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 6,
        }}
      />

      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            className="text-center lg:text-left space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-primary/20 text-foreground px-4 py-2 rounded-full font-body font-medium"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              Добре дошли в ДГ №48 "Ран Босилек"!
            </motion.div>

            <motion.h1
              className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Мястото, където детството е{' '}
              <span className="text-accent">щастливо,</span> а първите крачки
              към знанието – <span className="text-secondary">уверени.</span>
            </motion.h1>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Button variant="playful" size="xl">
                <Heart className="w-5 h-5 mr-2" />
                Запишете посещение
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Нашите програми
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap gap-8 justify-center lg:justify-start pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              {[
                { number: '15+', label: 'Години опит' },
                { number: '200+', label: 'Щастливи деца' },
                { number: '20+', label: 'Учители' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                >
                  <div className="font-display font-bold text-3xl text-accent">
                    {stat.number}
                  </div>
                  <div className="font-body text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          >
            <motion.div
              className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-card"
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src={heroImage}
                alt="Happy children playing and learning at Little Stars Kindergarten"
                className="w-full h-auto object-cover"
              />
            </motion.div>
            {/* Decorative elements around image */}
            <motion.div
              className="absolute -top-4 -right-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-2xl">⭐</span>
            </motion.div>
            <motion.div
              className="absolute -bottom-4 -left-4 w-12 h-12 bg-mint rounded-full flex items-center justify-center"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            >
              <span className="text-xl">🎨</span>
            </motion.div>
            <motion.div
              className="absolute top-1/2 -right-6 w-10 h-10 bg-accent rounded-full flex items-center justify-center"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2,
              }}
            >
              <span className="text-lg">📚</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
            fill="hsl(var(--card))"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
