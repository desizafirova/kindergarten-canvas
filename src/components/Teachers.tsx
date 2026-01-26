import { motion } from "framer-motion";
import { Heart, Star, Music, Palette } from "lucide-react";
import ScrollReveal from "./animations/ScrollReveal";
import StaggerChildren, { itemVariants } from "./animations/StaggerChildren";

import teacher1 from "@/assets/teachers/teacher-1.jpg";
import teacher2 from "@/assets/teachers/teacher-2.jpg";
import teacher3 from "@/assets/teachers/teacher-3.jpg";
import teacher4 from "@/assets/teachers/teacher-4.jpg";

interface Teacher {
  id: number;
  name: string;
  role: string;
  bio: string;
  image: string;
  icon: React.ReactNode;
  color: string;
}

const teachers: Teacher[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Head Teacher",
    bio: "With 15 years of experience, Sarah leads our team with passion and creativity. She believes every child has a unique spark waiting to shine!",
    image: teacher1,
    icon: <Star className="w-5 h-5" />,
    color: "bg-primary",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "STEM Educator",
    bio: "Michael makes science fun and accessible! His interactive experiments and nature explorations inspire curiosity in every little scientist.",
    image: teacher2,
    icon: <Heart className="w-5 h-5" />,
    color: "bg-secondary",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Art & Craft Teacher",
    bio: "Emily nurtures creativity through colors and imagination. Her art room is a magical space where masterpieces are born daily!",
    image: teacher3,
    icon: <Palette className="w-5 h-5" />,
    color: "bg-accent",
  },
  {
    id: 4,
    name: "Patricia Williams",
    role: "Music & Movement",
    bio: "With songs and dance, Patricia brings joy to learning. Her music classes are filled with laughter, rhythm, and happy memories.",
    image: teacher4,
    icon: <Music className="w-5 h-5" />,
    color: "bg-mint",
  },
];

const Teachers = () => {
  return (
    <section id="teachers" className="py-20 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-20 h-20 bg-purple/30 rounded-blob animate-blob" />
      <div className="absolute bottom-32 left-10 w-28 h-28 bg-secondary/20 rounded-blob animate-blob" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-mint/20 rounded-full animate-float" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple/30 text-purple-foreground rounded-full text-sm font-medium mb-4">
              👩‍🏫 Our Amazing Team
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Meet Our <span className="text-secondary">Teachers</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our dedicated educators bring warmth, expertise, and endless creativity to help your little ones grow and thrive!
            </p>
          </div>
        </ScrollReveal>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teachers.map((teacher) => (
            <motion.div
              key={teacher.id}
              variants={itemVariants}
              className="group"
            >
              <div className="relative bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Image container with overlay */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={teacher.image}
                    alt={teacher.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                  
                  {/* Role badge */}
                  <motion.div
                    className={`absolute top-4 right-4 ${teacher.color} text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {teacher.icon}
                    <span>{teacher.role}</span>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-6 relative">
                  {/* Decorative corner blob */}
                  <div className={`absolute -top-6 left-6 w-12 h-12 ${teacher.color}/20 rounded-blob`} />
                  
                  <h3 className="text-xl font-display font-bold text-foreground mb-2 relative z-10">
                    {teacher.name}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {teacher.bio}
                  </p>

                  {/* Hover effect line */}
                  <motion.div
                    className={`h-1 ${teacher.color} rounded-full mt-4 origin-left`}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </StaggerChildren>

        {/* Fun fact callout */}
        <ScrollReveal delay={0.4}>
          <motion.div
            className="mt-16 text-center bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-3xl p-8 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute top-4 left-8 text-4xl animate-bounce-slow">🌟</div>
            <div className="absolute bottom-4 right-8 text-4xl animate-wiggle">💖</div>
            
            <h3 className="text-2xl font-display font-bold text-foreground mb-2">
              Our Team Promise
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every member of our team is background-checked, CPR certified, and dedicated to providing a safe, nurturing environment where children can flourish.
            </p>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Teachers;
