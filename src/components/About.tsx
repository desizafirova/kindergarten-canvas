import { motion } from "framer-motion";
import { Shield, Heart, Lightbulb, Award } from "lucide-react";
import ScrollReveal from "./animations/ScrollReveal";
import StaggerChildren, { itemVariants } from "./animations/StaggerChildren";

const values = [
  {
    icon: Shield,
    title: "Safe Environment",
    description: "Secure, child-friendly spaces designed with your little one's safety as our top priority.",
    color: "text-secondary",
    bg: "bg-secondary/20",
  },
  {
    icon: Heart,
    title: "Loving Care",
    description: "Warm, nurturing teachers who treat every child with kindness and understanding.",
    color: "text-accent",
    bg: "bg-accent/20",
  },
  {
    icon: Lightbulb,
    title: "Creative Learning",
    description: "Innovative teaching methods that make learning fun and spark natural curiosity.",
    color: "text-primary",
    bg: "bg-primary/20",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Committed to the highest standards in early childhood education and development.",
    color: "text-mint",
    bg: "bg-mint/20",
  },
];

const About = () => {
  return (
    <section id="about" className="py-20 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-1/4 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <ScrollReveal direction="left" className="space-y-6">
            <span className="inline-block font-body font-medium text-mint bg-mint/20 px-4 py-1 rounded-full">
              About Us
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-foreground">
              A Place Where <span className="text-secondary">Dreams</span> Take Flight
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              For over 15 years, Little Stars Kindergarten has been a trusted partner in 
              early childhood education. Our play-based approach helps children develop 
              essential skills while having fun and building lasting friendships.
            </p>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              We believe every child is unique and deserves an environment that celebrates 
              their individuality while preparing them for the exciting journey ahead.
            </p>

            {/* Feature List */}
            <ul className="space-y-3 pt-4">
              {[
                "Small class sizes for personalized attention",
                "Certified and experienced educators",
                "Modern learning facilities and resources",
                "Regular parent communication and involvement",
              ].map((item, i) => (
                <motion.li
                  key={i}
                  className="flex items-center gap-3 font-body text-foreground"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                >
                  <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-sm">✓</span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </ScrollReveal>

          {/* Right - Values Grid */}
          <StaggerChildren className="grid grid-cols-2 gap-4 lg:gap-6" staggerDelay={0.15}>
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className={`${value.bg} rounded-3xl p-6 text-center cursor-default`}
              >
                <motion.div
                  className={`w-14 h-14 ${value.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                  whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
                >
                  <value.icon className={`w-7 h-7 ${value.color}`} />
                </motion.div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
};

export default About;
