import { motion } from "framer-motion";
import { Clock, Sun, Coffee, BookOpen, Palette, Music, Apple, Moon, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerChildren, { itemVariants } from "@/components/animations/StaggerChildren";

const scheduleItems = [
  {
    time: "7:30 - 8:30",
    activity: "Arrival & Welcome",
    description: "Warm greetings, health check, and settling in with free play activities",
    icon: Sun,
    color: "bg-accent",
  },
  {
    time: "8:30 - 9:00",
    activity: "Morning Circle",
    description: "Songs, calendar time, weather discussion, and sharing moments",
    icon: Music,
    color: "bg-primary",
  },
  {
    time: "9:00 - 10:00",
    activity: "Learning Centers",
    description: "Hands-on activities in literacy, math, science, and sensory areas",
    icon: BookOpen,
    color: "bg-secondary",
  },
  {
    time: "10:00 - 10:30",
    activity: "Healthy Snack",
    description: "Nutritious snacks with focus on healthy eating habits and social skills",
    icon: Apple,
    color: "bg-mint",
  },
  {
    time: "10:30 - 11:30",
    activity: "Outdoor Play",
    description: "Physical activities, nature exploration, and gross motor development",
    icon: Sparkles,
    color: "bg-sky",
  },
  {
    time: "11:30 - 12:00",
    activity: "Creative Arts",
    description: "Art projects, crafts, and creative expression activities",
    icon: Palette,
    color: "bg-purple",
  },
  {
    time: "12:00 - 12:45",
    activity: "Lunch Time",
    description: "Balanced meals in a family-style dining setting",
    icon: Coffee,
    color: "bg-accent",
  },
  {
    time: "12:45 - 2:30",
    activity: "Rest & Quiet Time",
    description: "Nap time for younger children, quiet activities for older ones",
    icon: Moon,
    color: "bg-primary",
  },
  {
    time: "2:30 - 3:00",
    activity: "Afternoon Snack",
    description: "Light refreshments and preparation for afternoon activities",
    icon: Apple,
    color: "bg-secondary",
  },
  {
    time: "3:00 - 4:30",
    activity: "Enrichment Programs",
    description: "Special activities like music, dance, yoga, or language classes",
    icon: Music,
    color: "bg-mint",
  },
  {
    time: "4:30 - 5:30",
    activity: "Free Play & Departure",
    description: "Indoor/outdoor play, parent communication, and farewell",
    icon: Sun,
    color: "bg-sky",
  },
];

const DailySchedule = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-secondary/20 to-background relative overflow-hidden">
          <motion.div
            className="absolute top-10 left-10 w-24 h-24 bg-primary/20"
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
            className="absolute bottom-10 right-10 w-32 h-32 bg-accent/20"
            animate={{
              borderRadius: [
                "30% 60% 70% 40% / 50% 60% 30% 60%",
                "60% 40% 30% 70% / 60% 30% 70% 40%",
                "30% 60% 70% 40% / 50% 60% 30% 60%",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="container mx-auto px-4">
            <ScrollReveal className="text-center max-w-3xl mx-auto">
              <span className="inline-block font-body font-medium text-secondary bg-secondary/20 px-4 py-1 rounded-full mb-4">
                Daily Schedule
              </span>
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                A Day Full of <span className="text-primary">Wonder</span>
              </h1>
              <p className="font-body text-lg text-muted-foreground">
                Our carefully planned daily routine balances structured learning with free play, 
                ensuring children develop academically, socially, and emotionally.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Schedule Timeline */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <StaggerChildren className="relative" staggerDelay={0.08}>
                {/* Timeline line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-secondary transform md:-translate-x-1/2 rounded-full" />

                {scheduleItems.map((item, index) => (
                  <motion.div
                    key={item.time}
                    variants={itemVariants}
                    className={`relative flex items-center gap-4 md:gap-8 mb-8 ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Timeline dot */}
                    <motion.div
                      className={`absolute left-8 md:left-1/2 w-4 h-4 ${item.color} rounded-full transform -translate-x-1/2 z-10 border-4 border-background`}
                      whileHover={{ scale: 1.5 }}
                    />

                    {/* Content card */}
                    <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${index % 2 === 0 ? "md:pr-8" : "md:pl-8"}`}>
                      <motion.div
                        className="bg-card rounded-2xl p-6 shadow-lg border border-border hover:border-primary/30 transition-all duration-300"
                        whileHover={{ y: -5 }}
                      >
                        <div className="flex items-start gap-4">
                          <motion.div
                            className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <item.icon className="w-6 h-6 text-foreground" />
                          </motion.div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-semibold text-primary">{item.time}</span>
                            </div>
                            <h3 className="font-display font-bold text-lg text-foreground mb-2">
                              {item.activity}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Spacer for alternating layout */}
                    <div className="hidden md:block md:w-[calc(50%-2rem)]" />
                  </motion.div>
                ))}
              </StaggerChildren>
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <ScrollReveal className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
                Important <span className="text-accent">Notes</span>
              </h2>
            </ScrollReveal>

            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Flexible Drop-off",
                  description: "Parents can drop off children between 7:30 - 8:30 AM",
                  color: "bg-primary",
                },
                {
                  title: "Meals Included",
                  description: "Breakfast, lunch, and two snacks are provided daily",
                  color: "bg-accent",
                },
                {
                  title: "Extended Care",
                  description: "Available until 6:00 PM for working parents",
                  color: "bg-secondary",
                },
              ].map((note) => (
                <ScrollReveal key={note.title}>
                  <div className="bg-background rounded-2xl p-6 text-center shadow-sm">
                    <div className={`w-3 h-3 ${note.color} rounded-full mx-auto mb-4`} />
                    <h3 className="font-display font-semibold text-foreground mb-2">{note.title}</h3>
                    <p className="text-sm text-muted-foreground">{note.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DailySchedule;
