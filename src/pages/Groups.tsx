import { motion } from "framer-motion";
import { Baby, Heart, Sparkles, Star, Users, Clock, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerChildren, { itemVariants } from "@/components/animations/StaggerChildren";

const groups = [
  {
    name: "Tiny Tots Nursery",
    ageRange: "1-2 years",
    capacity: "8 children",
    schedule: "8:00 AM - 12:00 PM",
    icon: Baby,
    color: "bg-purple",
    iconColor: "text-purple-foreground",
    description: "Specialized care for our youngest with focus on sensory development, attachment, and gentle routines that nurture early growth.",
    activities: ["Tummy time", "Sensory bins", "Lullabies & songs", "Soft play", "Feeding & diapering"],
  },
  {
    name: "Little Seedlings",
    ageRange: "2-3 years",
    capacity: "12 children",
    schedule: "8:00 AM - 1:00 PM",
    icon: Heart,
    color: "bg-accent",
    iconColor: "text-accent-foreground",
    description: "Our youngest learners explore the world through sensory play, music, and gentle routines that build confidence and security.",
    activities: ["Sensory exploration", "Circle time songs", "Outdoor play", "Story time", "Art exploration"],
  },
  {
    name: "Bright Butterflies",
    ageRange: "3-4 years",
    capacity: "15 children",
    schedule: "8:00 AM - 3:00 PM",
    icon: Heart,
    color: "bg-secondary",
    iconColor: "text-secondary-foreground",
    description: "Building social skills and independence through creative play, early literacy, and collaborative activities.",
    activities: ["Dramatic play", "Letter recognition", "Nature walks", "Music & movement", "Basic counting"],
  },
  {
    name: "Curious Cubs",
    ageRange: "4-5 years",
    capacity: "18 children",
    schedule: "8:00 AM - 4:00 PM",
    icon: Sparkles,
    color: "bg-mint",
    iconColor: "text-mint-foreground",
    description: "Preparing for school success with structured learning, problem-solving challenges, and advanced social development.",
    activities: ["Pre-reading skills", "Math concepts", "Science experiments", "Team projects", "Physical education"],
  },
  {
    name: "Rising Stars",
    ageRange: "5-6 years",
    capacity: "20 children",
    schedule: "8:00 AM - 5:00 PM",
    icon: Star,
    color: "bg-primary",
    iconColor: "text-primary-foreground",
    description: "Our pre-K program focuses on school readiness with advanced academics, leadership skills, and creative expression.",
    activities: ["Reading readiness", "Writing practice", "Critical thinking", "Leadership activities", "Creative arts"],
  },
];

const Groups = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-primary/10 to-background relative overflow-hidden">
          <motion.div
            className="absolute top-20 right-20 w-32 h-32 bg-accent/20"
            animate={{
              borderRadius: [
                "60% 40% 30% 70% / 60% 30% 70% 40%",
                "30% 60% 70% 40% / 50% 60% 30% 60%",
                "60% 40% 30% 70% / 60% 30% 70% 40%",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="container mx-auto px-4">
            <ScrollReveal className="text-center max-w-3xl mx-auto">
              <span className="inline-block font-body font-medium text-primary bg-primary/20 px-4 py-1 rounded-full mb-4">
                Our Groups
              </span>
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Age-Appropriate <span className="text-accent">Learning Groups</span>
              </h1>
              <p className="font-body text-lg text-muted-foreground">
                Each group is carefully designed to meet the developmental needs of children at different stages, 
                ensuring personalized attention and age-appropriate activities.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Groups Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <StaggerChildren className="grid md:grid-cols-2 gap-8" staggerDelay={0.15}>
              {groups.map((group) => (
                <motion.div
                  key={group.name}
                  variants={itemVariants}
                  className="bg-card rounded-3xl p-8 shadow-lg border-2 border-transparent hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <motion.div
                      className={`w-16 h-16 ${group.color} rounded-2xl flex items-center justify-center flex-shrink-0`}
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <group.icon className={`w-8 h-8 ${group.iconColor}`} />
                    </motion.div>
                    <div>
                      <h2 className="font-display font-bold text-2xl text-foreground mb-1">
                        {group.name}
                      </h2>
                      <p className="text-accent font-semibold">{group.ageRange}</p>
                    </div>
                  </div>

                  <p className="font-body text-muted-foreground mb-6 leading-relaxed">
                    {group.description}
                  </p>

                  <div className="flex flex-wrap gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{group.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4 text-secondary" />
                      <span>{group.schedule}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-3">Key Activities:</h3>
                    <div className="flex flex-wrap gap-2">
                      {group.activities.map((activity) => (
                        <span
                          key={activity}
                          className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* Daily Schedule Overview */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <ScrollReveal className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
                A Day at <span className="text-primary">Little Stars</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our structured yet flexible daily routine ensures children have time for learning, play, rest, and exploration.
              </p>
            </ScrollReveal>

            <div className="max-w-3xl mx-auto">
              <StaggerChildren className="space-y-4" staggerDelay={0.1}>
                {[
                  { time: "8:00 - 9:00", activity: "Arrival & Free Play", color: "bg-accent" },
                  { time: "9:00 - 10:00", activity: "Circle Time & Morning Activities", color: "bg-primary" },
                  { time: "10:00 - 10:30", activity: "Healthy Snack Time", color: "bg-secondary" },
                  { time: "10:30 - 12:00", activity: "Learning Centers & Outdoor Play", color: "bg-mint" },
                  { time: "12:00 - 1:00", activity: "Lunch & Rest Time", color: "bg-purple" },
                  { time: "1:00 - 3:00", activity: "Afternoon Activities & Specials", color: "bg-sky" },
                  { time: "3:00 - 5:00", activity: "Extended Care & Free Play", color: "bg-accent" },
                ].map((item) => (
                  <motion.div
                    key={item.time}
                    variants={itemVariants}
                    className="flex items-center gap-4 bg-background rounded-2xl p-4 shadow-sm"
                  >
                    <div className={`w-3 h-3 ${item.color} rounded-full`} />
                    <span className="font-semibold text-foreground w-32">{item.time}</span>
                    <span className="text-muted-foreground">{item.activity}</span>
                  </motion.div>
                ))}
              </StaggerChildren>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Groups;
