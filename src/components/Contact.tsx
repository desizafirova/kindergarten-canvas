import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-background relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <span className="inline-block font-body font-medium text-purple bg-purple/20 px-4 py-1 rounded-full mb-4">
            Get In Touch
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            Start Your Child's <span className="text-accent">Journey</span>
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to give your little one the best start? Reach out to schedule a visit 
            or learn more about our programs.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-card rounded-3xl p-8 shadow-lg">
              <h3 className="font-display font-bold text-2xl text-foreground mb-6">
                Contact Information
              </h3>
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: "Address", value: "123 Rainbow Lane, Sunshine City, SC 12345" },
                  { icon: Phone, label: "Phone", value: "(555) 123-4567" },
                  { icon: Mail, label: "Email", value: "hello@littlestars.edu" },
                  { icon: Clock, label: "Hours", value: "Mon-Fri: 7:00 AM - 6:00 PM" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-body text-sm text-muted-foreground">{item.label}</div>
                      <div className="font-body font-medium text-foreground">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fun fact card */}
            <div className="bg-secondary/20 rounded-3xl p-6 border-2 border-secondary/30">
              <div className="text-3xl mb-2">🎈</div>
              <h4 className="font-display font-bold text-lg text-foreground mb-2">
                Open House Every Month!
              </h4>
              <p className="font-body text-muted-foreground">
                Join us for a tour, meet our teachers, and see our classrooms in action.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card rounded-3xl p-8 shadow-lg">
            <h3 className="font-display font-bold text-2xl text-foreground mb-6">
              Send Us a Message
            </h3>
            <form className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm text-muted-foreground block mb-2">
                    Parent's Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl font-body focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="font-body text-sm text-muted-foreground block mb-2">
                    Child's Age
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 3 years"
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl font-body focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="font-body text-sm text-muted-foreground block mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl font-body focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="font-body text-sm text-muted-foreground block mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="(555) 000-0000"
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl font-body focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="font-body text-sm text-muted-foreground block mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your child and any questions you have..."
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl font-body focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              <Button variant="playful" size="xl" className="w-full">
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
