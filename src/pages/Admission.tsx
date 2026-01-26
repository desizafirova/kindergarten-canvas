import { motion } from "framer-motion";
import { ClipboardList, FileText, UserCheck, Calendar, Phone, CheckCircle, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerChildren, { itemVariants } from "@/components/animations/StaggerChildren";

const admissionSteps = [
  {
    step: 1,
    title: "Submit Inquiry",
    description: "Fill out our online inquiry form or call us to express your interest. We'll respond within 24 hours.",
    icon: ClipboardList,
    color: "bg-accent",
  },
  {
    step: 2,
    title: "Schedule a Tour",
    description: "Visit our facility to meet our teachers, see our classrooms, and experience our learning environment.",
    icon: Calendar,
    color: "bg-secondary",
  },
  {
    step: 3,
    title: "Complete Application",
    description: "Submit the full application form along with all required documents listed below.",
    icon: FileText,
    color: "bg-mint",
  },
  {
    step: 4,
    title: "Parent Interview",
    description: "Meet with our director to discuss your child's needs, your expectations, and answer any questions.",
    icon: Phone,
    color: "bg-primary",
  },
  {
    step: 5,
    title: "Enrollment Confirmation",
    description: "Receive your acceptance letter and complete the enrollment process with payment of registration fees.",
    icon: UserCheck,
    color: "bg-purple",
  },
];

const requiredDocuments = [
  {
    category: "Child's Documents",
    items: [
      "Birth certificate (original and copy)",
      "Passport-size photos (4 copies)",
      "Immunization records",
      "Recent health checkup report",
      "Previous school records (if applicable)",
    ],
  },
  {
    category: "Parent/Guardian Documents",
    items: [
      "Parent/Guardian ID copies",
      "Proof of address (utility bill or bank statement)",
      "Emergency contact information",
      "Authorized pickup persons list with photos",
    ],
  },
  {
    category: "Medical Information",
    items: [
      "Allergy information form",
      "Medical authorization form",
      "Special needs documentation (if applicable)",
      "Medication administration form (if needed)",
    ],
  },
];

const Admission = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-secondary/10 to-background relative overflow-hidden">
          <motion.div
            className="absolute bottom-10 left-20 w-24 h-24 bg-primary/20"
            animate={{
              borderRadius: [
                "30% 60% 70% 40% / 50% 60% 30% 60%",
                "60% 40% 30% 70% / 60% 30% 70% 40%",
                "30% 60% 70% 40% / 50% 60% 30% 60%",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="container mx-auto px-4">
            <ScrollReveal className="text-center max-w-3xl mx-auto">
              <span className="inline-block font-body font-medium text-secondary bg-secondary/20 px-4 py-1 rounded-full mb-4">
                Join Our Family
              </span>
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Admission <span className="text-primary">Process</span>
              </h1>
              <p className="font-body text-lg text-muted-foreground">
                We're excited you're considering Little Stars for your child! 
                Here's everything you need to know about joining our kindergarten family.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Admission Steps */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <ScrollReveal className="text-center mb-16">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
                Simple <span className="text-accent">5-Step</span> Process
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our streamlined admission process is designed to be stress-free for busy parents.
              </p>
            </ScrollReveal>

            <div className="max-w-4xl mx-auto">
              <StaggerChildren className="relative" staggerDelay={0.15}>
                {/* Connecting line */}
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-border hidden md:block" />

                {admissionSteps.map((step, index) => (
                  <motion.div
                    key={step.step}
                    variants={itemVariants}
                    className="flex gap-6 mb-8 last:mb-0"
                  >
                    <motion.div
                      className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <div className="bg-card rounded-2xl p-6 flex-1 shadow-sm border border-border/50">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-muted-foreground">Step {step.step}</span>
                        {index < admissionSteps.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-muted-foreground/50 hidden sm:block" />
                        )}
                      </div>
                      <h3 className="font-display font-bold text-xl text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </StaggerChildren>
            </div>
          </div>
        </section>

        {/* Required Documents */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <ScrollReveal className="text-center mb-16">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
                Required <span className="text-secondary">Documents</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Please prepare the following documents before your application meeting.
              </p>
            </ScrollReveal>

            <StaggerChildren className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto" staggerDelay={0.15}>
              {requiredDocuments.map((doc) => (
                <motion.div
                  key={doc.category}
                  variants={itemVariants}
                  className="bg-background rounded-3xl p-6 shadow-sm"
                >
                  <h3 className="font-display font-bold text-lg text-foreground mb-4 pb-3 border-b border-border">
                    {doc.category}
                  </h3>
                  <ul className="space-y-3">
                    {doc.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* Important Dates & Fees */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <ScrollReveal direction="left">
                <div className="bg-primary/10 rounded-3xl p-8">
                  <h3 className="font-display font-bold text-2xl text-foreground mb-6">
                    Important Dates
                  </h3>
                  <ul className="space-y-4">
                    {[
                      { label: "Open Enrollment", value: "January 15 - March 30" },
                      { label: "Late Enrollment", value: "April 1 - May 15" },
                      { label: "School Year Begins", value: "September 1" },
                      { label: "Orientation Day", value: "August 25" },
                    ].map((item) => (
                      <li key={item.label} className="flex justify-between items-center py-2 border-b border-primary/20 last:border-0">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-semibold text-foreground">{item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right">
                <div className="bg-accent/10 rounded-3xl p-8">
                  <h3 className="font-display font-bold text-2xl text-foreground mb-6">
                    Fee Structure
                  </h3>
                  <ul className="space-y-4">
                    {[
                      { label: "Registration Fee", value: "$150 (one-time)" },
                      { label: "Monthly Tuition", value: "From $800/month" },
                      { label: "Materials Fee", value: "$200/year" },
                      { label: "Extended Care", value: "$15/hour" },
                    ].map((item) => (
                      <li key={item.label} className="flex justify-between items-center py-2 border-b border-accent/20 last:border-0">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-semibold text-foreground">{item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-accent">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-white/90 mb-8 max-w-xl mx-auto">
                Contact us today to schedule a tour or submit your inquiry. 
                We can't wait to welcome your little star to our family!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" variant="secondary" className="font-display">
                  Schedule a Tour
                </Button>
                <Button size="xl" variant="outline" className="bg-white/10 border-white text-white hover:bg-white hover:text-primary font-display">
                  <Download className="w-5 h-5 mr-2" />
                  Download Forms
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Admission;
