import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Sun, Coffee, BookOpen, Palette, Music, Apple, Moon, Sparkles, Baby, Heart, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerChildren, { itemVariants } from "@/components/animations/StaggerChildren";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ScheduleItem = {
  time: string;
  activity: string;
  description: string;
  icon: typeof Sun;
  color: string;
};

const scheduleVariants: Record<string, { label: string; icon: typeof Baby; schedule: ScheduleItem[] }> = {
  nursery: {
    label: "Nursery",
    icon: Baby,
    schedule: [
      { time: "8:00 - 8:30", activity: "Arrival & Greeting", description: "Warm welcome, health check, and comfort settling", icon: Sun, color: "bg-accent" },
      { time: "8:30 - 9:00", activity: "Free Play", description: "Soft toys, sensory materials, and gentle exploration", icon: Sparkles, color: "bg-primary" },
      { time: "9:00 - 9:30", activity: "Morning Snack", description: "Healthy finger foods and milk time", icon: Apple, color: "bg-mint" },
      { time: "9:30 - 10:30", activity: "Sensory Activities", description: "Tummy time, sensory bins, and tactile exploration", icon: Palette, color: "bg-secondary" },
      { time: "10:30 - 11:00", activity: "Music & Movement", description: "Lullabies, gentle songs, and soft movement", icon: Music, color: "bg-sky" },
      { time: "11:00 - 11:45", activity: "Rest Time", description: "Nap time with soothing environment", icon: Moon, color: "bg-purple" },
      { time: "11:45 - 12:00", activity: "Departure", description: "Parent pick-up and daily report sharing", icon: Sun, color: "bg-accent" },
    ],
  },
  seedlings: {
    label: "Seedlings",
    icon: Heart,
    schedule: [
      { time: "8:00 - 8:30", activity: "Arrival & Welcome", description: "Greeting, health check, and settling activities", icon: Sun, color: "bg-accent" },
      { time: "8:30 - 9:00", activity: "Morning Circle", description: "Simple songs, weather check, and hello time", icon: Music, color: "bg-primary" },
      { time: "9:00 - 9:30", activity: "Healthy Snack", description: "Nutritious snacks with social interaction", icon: Apple, color: "bg-mint" },
      { time: "9:30 - 10:30", activity: "Play-Based Learning", description: "Sensory play, building blocks, and exploration", icon: Sparkles, color: "bg-secondary" },
      { time: "10:30 - 11:30", activity: "Outdoor Time", description: "Sandbox play, nature walks, and fresh air", icon: Sun, color: "bg-sky" },
      { time: "11:30 - 12:00", activity: "Story Time", description: "Picture books and puppet shows", icon: BookOpen, color: "bg-purple" },
      { time: "12:00 - 12:30", activity: "Lunch", description: "Balanced meal in a supportive environment", icon: Coffee, color: "bg-accent" },
      { time: "12:30 - 1:00", activity: "Rest & Departure", description: "Quiet time and parent pick-up", icon: Moon, color: "bg-primary" },
    ],
  },
  butterflies: {
    label: "Butterflies",
    icon: Sparkles,
    schedule: [
      { time: "8:00 - 8:30", activity: "Arrival & Free Play", description: "Warm greetings and choice of activities", icon: Sun, color: "bg-accent" },
      { time: "8:30 - 9:00", activity: "Morning Circle", description: "Songs, calendar, weather, and sharing time", icon: Music, color: "bg-primary" },
      { time: "9:00 - 10:00", activity: "Learning Centers", description: "Art, dramatic play, blocks, and sensory stations", icon: BookOpen, color: "bg-secondary" },
      { time: "10:00 - 10:30", activity: "Healthy Snack", description: "Nutritious snacks with conversation", icon: Apple, color: "bg-mint" },
      { time: "10:30 - 11:30", activity: "Outdoor Play", description: "Climbing, running, sandbox, and nature exploration", icon: Sparkles, color: "bg-sky" },
      { time: "11:30 - 12:00", activity: "Creative Arts", description: "Painting, crafts, and creative expression", icon: Palette, color: "bg-purple" },
      { time: "12:00 - 12:45", activity: "Lunch Time", description: "Family-style dining experience", icon: Coffee, color: "bg-accent" },
      { time: "12:45 - 2:30", activity: "Rest Time", description: "Nap for those who need, quiet activities for others", icon: Moon, color: "bg-primary" },
      { time: "2:30 - 3:00", activity: "Afternoon Snack & Departure", description: "Light refreshments and parent pick-up", icon: Apple, color: "bg-secondary" },
    ],
  },
  cubs: {
    label: "Cubs",
    icon: Sparkles,
    schedule: [
      { time: "8:00 - 8:30", activity: "Arrival & Morning Work", description: "Self-directed activities and morning routines", icon: Sun, color: "bg-accent" },
      { time: "8:30 - 9:15", activity: "Morning Meeting", description: "Calendar, weather, letter/number of the day, news sharing", icon: Music, color: "bg-primary" },
      { time: "9:15 - 10:15", activity: "Literacy & Math", description: "Structured learning through play and activities", icon: BookOpen, color: "bg-secondary" },
      { time: "10:15 - 10:45", activity: "Healthy Snack", description: "Nutritious break with peer interaction", icon: Apple, color: "bg-mint" },
      { time: "10:45 - 11:45", activity: "Outdoor Learning", description: "Physical activities, nature science, and group games", icon: Sparkles, color: "bg-sky" },
      { time: "11:45 - 12:30", activity: "Creative Expression", description: "Art projects, music, and dramatic play", icon: Palette, color: "bg-purple" },
      { time: "12:30 - 1:15", activity: "Lunch", description: "Self-serve family-style dining", icon: Coffee, color: "bg-accent" },
      { time: "1:15 - 2:30", activity: "Quiet Time", description: "Rest, reading, or quiet activities", icon: Moon, color: "bg-primary" },
      { time: "2:30 - 3:30", activity: "Enrichment Activities", description: "Special projects, STEM, and exploration", icon: Sparkles, color: "bg-secondary" },
      { time: "3:30 - 4:00", activity: "Afternoon Snack & Departure", description: "Refreshments and parent communication", icon: Apple, color: "bg-mint" },
    ],
  },
  stars: {
    label: "Stars",
    icon: Star,
    schedule: [
      { time: "8:00 - 8:30", activity: "Arrival & Independent Work", description: "Journaling, reading, and morning tasks", icon: Sun, color: "bg-accent" },
      { time: "8:30 - 9:30", activity: "Morning Meeting & Calendar", description: "Group discussion, news, and daily planning", icon: Music, color: "bg-primary" },
      { time: "9:30 - 10:30", activity: "Literacy Block", description: "Reading, writing, phonics, and language arts", icon: BookOpen, color: "bg-secondary" },
      { time: "10:30 - 11:00", activity: "Healthy Snack", description: "Nutritious break and social time", icon: Apple, color: "bg-mint" },
      { time: "11:00 - 12:00", activity: "Math & Science", description: "Number concepts, problem-solving, and experiments", icon: Sparkles, color: "bg-sky" },
      { time: "12:00 - 12:45", activity: "Lunch", description: "Independent dining with conversation", icon: Coffee, color: "bg-accent" },
      { time: "12:45 - 1:30", activity: "Quiet Reading", description: "Independent reading and rest time", icon: Moon, color: "bg-purple" },
      { time: "1:30 - 2:30", activity: "Outdoor Physical Education", description: "Structured games, sports, and active play", icon: Sun, color: "bg-primary" },
      { time: "2:30 - 3:30", activity: "Specials", description: "Art, music, foreign language, or technology", icon: Palette, color: "bg-secondary" },
      { time: "3:30 - 4:30", activity: "Project Time", description: "Extended learning projects and group work", icon: Sparkles, color: "bg-mint" },
      { time: "4:30 - 5:00", activity: "Afternoon Snack & Departure", description: "Reflection, snack, and parent pick-up", icon: Apple, color: "bg-sky" },
    ],
  },
};

const groupInfo = {
  nursery: { age: "1-2 years", description: "Specialized care for our youngest" },
  seedlings: { age: "2-3 years", description: "Gentle introduction to structured play" },
  butterflies: { age: "3-4 years", description: "Building social and creative skills" },
  cubs: { age: "4-5 years", description: "Preparing for school success" },
  stars: { age: "5-6 years", description: "Pre-K intensive program" },
};

const DailySchedule = () => {
  const [selectedGroup, setSelectedGroup] = useState("butterflies");
  const currentSchedule = scheduleVariants[selectedGroup];

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

        {/* Group Selector */}
        <section className="py-8 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-4">
              <h2 className="font-display font-semibold text-lg text-foreground">Select Age Group:</h2>
              <ToggleGroup
                type="single"
                value={selectedGroup}
                onValueChange={(value) => value && setSelectedGroup(value)}
                className="flex flex-wrap justify-center gap-2"
              >
                {Object.entries(scheduleVariants).map(([key, variant]) => (
                  <ToggleGroupItem
                    key={key}
                    value={key}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300 ${
                      selectedGroup === key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:border-primary/50"
                    }`}
                  >
                    <variant.icon className="w-4 h-4" />
                    <span className="font-medium">{variant.label}</span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <motion.div
                key={selectedGroup}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <span className="text-sm text-muted-foreground">
                  {groupInfo[selectedGroup as keyof typeof groupInfo].age} • {groupInfo[selectedGroup as keyof typeof groupInfo].description}
                </span>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Schedule Timeline */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedGroup}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <StaggerChildren className="relative" staggerDelay={0.08}>
                    {/* Timeline line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-secondary transform md:-translate-x-1/2 rounded-full" />

                    {currentSchedule.schedule.map((item, index) => (
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
                </motion.div>
              </AnimatePresence>
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
