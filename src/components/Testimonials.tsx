import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import ScrollReveal from "./animations/ScrollReveal";

const testimonials = [
  {
    quote: "Little Stars has been a second home for our daughter. The teachers are incredibly caring, and we've seen amazing growth in her confidence and social skills.",
    author: "Sarah M.",
    role: "Parent of Emma, Age 4",
    avatar: "👩",
  },
  {
    quote: "The creative curriculum keeps my son excited about learning every day. He comes home with new songs, crafts, and stories to share with us!",
    author: "David L.",
    role: "Parent of Leo, Age 5",
    avatar: "👨",
  },
  {
    quote: "As working parents, we needed a safe and nurturing environment. Little Stars exceeded our expectations in every way possible.",
    author: "Jennifer K.",
    role: "Parent of Mia, Age 3",
    avatar: "👩‍🦰",
  },
  {
    quote: "The outdoor play and nature programs are fantastic! My kids have developed a real love for exploring and learning about the environment.",
    author: "Michael R.",
    role: "Parent of Twins, Age 4",
    avatar: "👨‍🦱",
  },
];

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 bg-card relative overflow-hidden">
      {/* Decorative Blobs */}
      <motion.div
        className="absolute top-10 left-10 w-24 h-24 bg-accent/20"
        animate={{
          borderRadius: [
            "60% 40% 30% 70% / 60% 30% 70% 40%",
            "30% 60% 70% 40% / 50% 60% 30% 60%",
            "60% 40% 30% 70% / 60% 30% 70% 40%",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-32 h-32 bg-primary/20"
        animate={{
          borderRadius: [
            "30% 60% 70% 40% / 50% 60% 30% 60%",
            "60% 40% 30% 70% / 60% 30% 70% 40%",
            "30% 60% 70% 40% / 50% 60% 30% 60%",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block font-body font-medium text-accent bg-accent/20 px-4 py-1 rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            What <span className="text-secondary">Parents</span> Say
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from the families who have experienced the Little Stars difference.
          </p>
        </ScrollReveal>

        {/* Testimonial Carousel */}
        <ScrollReveal delay={0.2} className="max-w-4xl mx-auto">
          <div className="relative bg-background rounded-3xl p-8 lg:p-12 shadow-xl overflow-hidden">
            {/* Quote Icon */}
            <motion.div
              className="absolute -top-6 left-8 w-12 h-12 bg-primary rounded-full flex items-center justify-center"
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
            >
              <Quote className="w-6 h-6 text-primary-foreground" />
            </motion.div>

            {/* Content */}
            <div className="pt-4 min-h-[200px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <p className="font-body text-lg md:text-xl text-foreground leading-relaxed mb-8">
                    "{testimonials[currentIndex].quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="w-14 h-14 bg-secondary/20 rounded-full flex items-center justify-center text-2xl"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      {testimonials[currentIndex].avatar}
                    </motion.div>
                    <div>
                      <div className="font-display font-bold text-foreground">
                        {testimonials[currentIndex].author}
                      </div>
                      <div className="font-body text-sm text-muted-foreground">
                        {testimonials[currentIndex].role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentIndex ? 1 : -1);
                      setCurrentIndex(index);
                    }}
                    className={`h-3 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-accent w-8"
                        : "bg-muted hover:bg-muted-foreground/30 w-3"
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <motion.button
                  onClick={prev}
                  className="w-10 h-10 rounded-full bg-muted hover:bg-secondary hover:text-secondary-foreground transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={next}
                  className="w-10 h-10 rounded-full bg-muted hover:bg-secondary hover:text-secondary-foreground transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Testimonials;
