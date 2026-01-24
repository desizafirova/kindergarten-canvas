import { motion, type Variants } from "framer-motion";
import { Palette, Music, Calculator, TreePine, Users, Puzzle } from "lucide-react";
import ScrollReveal from "./animations/ScrollReveal";
import StaggerChildren, { itemVariants } from "./animations/StaggerChildren";

const programs = [
  {
    icon: Palette,
    title: "Arts & Crafts",
    description: "Express creativity through painting, drawing, and hands-on crafting activities.",
    color: "bg-accent",
    iconColor: "text-accent-foreground",
  },
  {
    icon: Music,
    title: "Music & Movement",
    description: "Develop rhythm and coordination through fun songs, dance, and musical play.",
    color: "bg-secondary",
    iconColor: "text-secondary-foreground",
  },
  {
    icon: Calculator,
    title: "Early Math",
    description: "Build number sense and problem-solving skills through playful exploration.",
    color: "bg-mint",
    iconColor: "text-mint-foreground",
  },
  {
    icon: TreePine,
    title: "Nature Discovery",
    description: "Explore the natural world with outdoor adventures and science experiments.",
    color: "bg-primary",
    iconColor: "text-primary-foreground",
  },
  {
    icon: Users,
    title: "Social Skills",
    description: "Learn to share, cooperate, and build friendships in a supportive environment.",
    color: "bg-purple",
    iconColor: "text-purple-foreground",
  },
  {
    icon: Puzzle,
    title: "Critical Thinking",
    description: "Solve puzzles and challenges that spark curiosity and logical reasoning.",
    color: "bg-sky",
    iconColor: "text-sky-foreground",
  },
];

const Programs = () => {
  return (
    <section id="programs" className="py-20 bg-card relative">
      {/* Decorative elements */}
      <motion.div
        className="absolute top-10 right-10 w-20 h-20 bg-primary/20"
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
        className="absolute bottom-10 left-10 w-16 h-16 bg-secondary/20"
        animate={{
          borderRadius: [
            "30% 60% 70% 40% / 50% 60% 30% 60%",
            "60% 40% 30% 70% / 60% 30% 70% 40%",
            "30% 60% 70% 40% / 50% 60% 30% 60%",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block font-body font-medium text-secondary bg-secondary/20 px-4 py-1 rounded-full mb-4">
            Our Programs
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            Fun Ways to <span className="text-accent">Learn & Grow</span>
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Our carefully designed programs nurture every aspect of your child's development 
            through engaging, age-appropriate activities.
          </p>
        </ScrollReveal>

        {/* Programs Grid */}
        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" staggerDelay={0.1}>
          {programs.map((program) => (
            <motion.div
              key={program.title}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group bg-background rounded-3xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-primary/30"
            >
              <motion.div
                className={`w-16 h-16 ${program.color} rounded-2xl flex items-center justify-center mb-6`}
                whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
              >
                <program.icon className={`w-8 h-8 ${program.iconColor}`} />
              </motion.div>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">
                {program.title}
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                {program.description}
              </p>
            </motion.div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
};

export default Programs;
