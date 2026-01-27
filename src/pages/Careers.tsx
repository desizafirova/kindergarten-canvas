import { motion } from "framer-motion";
import { Briefcase, Heart, GraduationCap, Clock, MapPin, Send, CheckCircle, Users, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerChildren, { itemVariants } from "@/components/animations/StaggerChildren";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import JobApplicationForm from "@/components/careers/JobApplicationForm";
const openPositions = [
  {
    title: "Lead Preschool Teacher",
    type: "Full-time",
    location: "On-site",
    department: "Education",
    description: "Lead a classroom of 15-18 children ages 3-4, implementing our play-based curriculum and fostering a love of learning.",
    requirements: [
      "Bachelor's degree in Early Childhood Education",
      "3+ years of preschool teaching experience",
      "State teaching certification",
      "CPR and First Aid certified",
    ],
  },
  {
    title: "Assistant Teacher",
    type: "Full-time",
    location: "On-site",
    department: "Education",
    description: "Support lead teachers in daily classroom activities, ensuring a safe and nurturing environment for young learners.",
    requirements: [
      "Associate degree in Child Development or related field",
      "1+ year experience in childcare",
      "Passion for early childhood education",
      "Strong communication skills",
    ],
  },
  {
    title: "Music & Movement Instructor",
    type: "Part-time",
    location: "On-site",
    department: "Enrichment",
    description: "Design and lead engaging music and movement classes for children ages 2-6, incorporating songs, instruments, and dance.",
    requirements: [
      "Background in music education or performing arts",
      "Experience working with young children",
      "Creative and energetic personality",
      "Ability to play basic instruments",
    ],
  },
  {
    title: "Administrative Coordinator",
    type: "Full-time",
    location: "On-site",
    department: "Operations",
    description: "Manage front desk operations, parent communications, enrollment processes, and support overall school administration.",
    requirements: [
      "2+ years of administrative experience",
      "Excellent organizational skills",
      "Proficiency in office software",
      "Friendly and professional demeanor",
    ],
  },
];

const benefits = [
  {
    icon: Heart,
    title: "Health & Wellness",
    description: "Comprehensive medical, dental, and vision insurance for you and your family",
  },
  {
    icon: GraduationCap,
    title: "Professional Development",
    description: "Annual training budget and opportunities for continuing education",
  },
  {
    icon: Users,
    title: "Supportive Team",
    description: "Work alongside passionate educators in a collaborative environment",
  },
  {
    icon: Sparkles,
    title: "Childcare Discount",
    description: "50% tuition discount for employees' children enrolled at Little Stars",
  },
];

const Careers = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-mint/20 to-background relative overflow-hidden">
          <motion.div
            className="absolute top-20 right-20 w-40 h-40 bg-primary/10"
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
            className="absolute bottom-10 left-10 w-24 h-24 bg-accent/20"
            animate={{
              borderRadius: [
                "30% 60% 70% 40% / 50% 60% 30% 60%",
                "60% 40% 30% 70% / 60% 30% 70% 40%",
                "30% 60% 70% 40% / 50% 60% 30% 60%",
              ],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="container mx-auto px-4">
            <ScrollReveal className="text-center max-w-3xl mx-auto">
              <span className="inline-block font-body font-medium text-mint bg-mint/20 px-4 py-1 rounded-full mb-4">
                Join Our Team
              </span>
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Shape Young <span className="text-accent">Minds</span>
              </h1>
              <p className="font-body text-lg text-muted-foreground mb-8">
                Join our team of dedicated educators who are passionate about making a difference 
                in children's lives. We're looking for caring, creative individuals to help little stars shine.
              </p>
              <Button variant="playful" size="xl">
                <Briefcase className="w-5 h-5 mr-2" />
                View Open Positions
              </Button>
            </ScrollReveal>
          </div>
        </section>

        {/* Why Work With Us */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <ScrollReveal className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
                Why Work at <span className="text-primary">Little Stars</span>?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We believe in nurturing not just our students, but also our team members. Here's what makes us special.
              </p>
            </ScrollReveal>

            <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
              {benefits.map((benefit) => (
                <motion.div
                  key={benefit.title}
                  variants={itemVariants}
                  className="text-center"
                >
                  <motion.div
                    className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h3 className="font-display font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <ScrollReveal className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
                Open <span className="text-accent">Positions</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore our current job openings and find your perfect role in early childhood education.
              </p>
            </ScrollReveal>

            <StaggerChildren className="max-w-4xl mx-auto space-y-6" staggerDelay={0.1}>
              {openPositions.map((position) => (
                <motion.div key={position.title} variants={itemVariants}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="bg-background">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <CardTitle className="font-display text-xl text-foreground mb-2">
                            {position.title}
                          </CardTitle>
                          <div className="flex flex-wrap gap-3 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {position.type}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              {position.location}
                            </span>
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                              {position.department}
                            </span>
                          </div>
                        </div>
                        <Button variant="playful" size="sm">
                          <Send className="w-4 h-4 mr-1" />
                          Apply Now
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-muted-foreground mb-4">{position.description}</p>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Requirements:</h4>
                        <ul className="space-y-1">
                          {position.requirements.map((req) => (
                            <li key={req} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* Application Form */}
        <section id="apply" className="py-20">
          <div className="container mx-auto px-4">
            <ScrollReveal className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
                Apply <span className="text-primary">Now</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ready to make a difference? Fill out the application form below and join our team of dedicated educators.
              </p>
            </ScrollReveal>
            <JobApplicationForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
