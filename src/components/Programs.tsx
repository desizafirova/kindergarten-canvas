import { Palette, Music, Calculator, TreePine, Users, Puzzle } from "lucide-react";

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
      <div className="absolute top-10 right-10 w-20 h-20 bg-primary/20 rounded-blob animate-blob" />
      <div className="absolute bottom-10 left-10 w-16 h-16 bg-secondary/20 rounded-blob animate-blob" style={{ animationDelay: "3s" }} />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
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
        </div>

        {/* Programs Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {programs.map((program, index) => (
            <div
              key={program.title}
              className="group bg-background rounded-3xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-primary/30"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-16 h-16 ${program.color} rounded-2xl flex items-center justify-center mb-6 group-hover:animate-wiggle transition-transform`}>
                <program.icon className={`w-8 h-8 ${program.iconColor}`} />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">
                {program.title}
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                {program.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;
