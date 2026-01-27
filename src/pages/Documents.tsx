import { motion } from "framer-motion";
import { FileText, ScrollText, ClipboardList, Shield, ExternalLink, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerChildren, { itemVariants } from "@/components/animations/StaggerChildren";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const documentCategories = [
  {
    id: "program",
    title: "Program System",
    icon: BookOpen,
    color: "bg-primary",
    description: "Our educational philosophy and curriculum framework",
    documents: [
      {
        title: "Educational Program Overview",
        description: "Comprehensive guide to our teaching methodology and learning objectives",
      },
      {
        title: "Curriculum Framework",
        description: "Detailed breakdown of age-appropriate learning activities and goals",
      },
      {
        title: "Development Milestones",
        description: "Expected developmental achievements for each age group",
      },
    ],
  },
  {
    id: "rules",
    title: "Internal Rules",
    icon: ScrollText,
    color: "bg-secondary",
    description: "Kindergarten policies and guidelines for parents and children",
    documents: [
      {
        title: "Parent Handbook",
        description: "Complete guide for parents including drop-off/pick-up procedures and communication policies",
      },
      {
        title: "Behavior Guidelines",
        description: "Positive discipline approach and behavior expectations",
      },
      {
        title: "Health & Safety Protocols",
        description: "Illness policies, medication administration, and emergency procedures",
      },
      {
        title: "Attendance Policy",
        description: "Guidelines for attendance, absences, and vacation requests",
      },
    ],
  },
  {
    id: "regulations",
    title: "Regulations & Compliance",
    icon: Shield,
    color: "bg-mint",
    description: "Legal requirements and regulatory compliance documents",
    documents: [
      {
        title: "GDPR Privacy Policy",
        description: "How we collect, use, and protect personal data",
      },
      {
        title: "Child Protection Policy",
        description: "Our commitment to safeguarding children's welfare",
      },
      {
        title: "Equal Opportunities Policy",
        description: "Our dedication to inclusivity and non-discrimination",
      },
      {
        title: "Complaints Procedure",
        description: "How to raise concerns and our resolution process",
      },
    ],
  },
  {
    id: "forms",
    title: "Forms & Applications",
    icon: ClipboardList,
    color: "bg-accent",
    description: "Downloadable forms for enrollment and permissions",
    documents: [
      {
        title: "Enrollment Application",
        description: "Complete application form for new student registration",
      },
      {
        title: "Medical Information Form",
        description: "Health history and emergency contact details",
      },
      {
        title: "Photo/Media Release",
        description: "Permission for using photos in promotional materials",
      },
      {
        title: "Field Trip Permission",
        description: "General authorization for educational outings",
      },
    ],
  },
];

const Documents = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-primary/10 to-background relative overflow-hidden">
          <motion.div
            className="absolute top-20 left-20 w-28 h-28 bg-secondary/20"
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
            className="absolute bottom-10 right-10 w-24 h-24 bg-accent/20"
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
              <span className="inline-block font-body font-medium text-primary bg-primary/20 px-4 py-1 rounded-full mb-4">
                Documents & Policies
              </span>
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Institutional <span className="text-secondary">Documents</span>
              </h1>
              <p className="font-body text-lg text-muted-foreground">
                Access our official documents, policies, and forms. We believe in transparency 
                and keeping parents informed about all aspects of our kindergarten.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Documents Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {documentCategories.map((category, categoryIndex) => (
                  <ScrollReveal key={category.id} delay={categoryIndex * 0.1}>
                    <AccordionItem
                      value={category.id}
                      className="bg-card rounded-2xl border-2 border-transparent hover:border-primary/30 transition-all duration-300 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center gap-4">
                          <motion.div
                            className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center`}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <category.icon className="w-6 h-6 text-foreground" />
                          </motion.div>
                          <div className="text-left">
                            <h3 className="font-display font-bold text-lg text-foreground">
                              {category.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {category.description}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <StaggerChildren className="space-y-3 pt-4" staggerDelay={0.05}>
                          {category.documents.map((doc) => (
                            <motion.div
                              key={doc.title}
                              variants={itemVariants}
                              className="flex items-center justify-between gap-4 bg-background rounded-xl p-4 shadow-sm"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                <div>
                                  <h4 className="font-semibold text-foreground text-sm">
                                    {doc.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {doc.description}
                                  </p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="flex-shrink-0">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </motion.div>
                          ))}
                        </StaggerChildren>
                      </AccordionContent>
                    </AccordionItem>
                  </ScrollReveal>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Contact for Documents */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <ScrollReveal className="text-center max-w-2xl mx-auto">
              <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-4">
                Need a Specific Document?
              </h2>
              <p className="text-muted-foreground mb-6">
                If you can't find what you're looking for, please contact our administration 
                office and we'll be happy to assist you.
              </p>
              <Button variant="playful" size="lg">
                Contact Administration
              </Button>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Documents;
