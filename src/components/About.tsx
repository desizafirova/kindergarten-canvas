import { Shield, Heart, Lightbulb, Award } from "lucide-react";

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
          <div className="space-y-6 animate-fade-in">
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
                <li key={i} className="flex items-center gap-3 font-body text-foreground">
                  <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-sm">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right - Values Grid */}
          <div className="grid grid-cols-2 gap-4 lg:gap-6">
            {values.map((value, index) => (
              <div
                key={value.title}
                className={`${value.bg} rounded-3xl p-6 text-center hover:scale-105 transition-transform duration-300`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`w-14 h-14 ${value.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <value.icon className={`w-7 h-7 ${value.color}`} />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
