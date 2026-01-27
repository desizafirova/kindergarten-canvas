import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScrollReveal from "@/components/animations/ScrollReveal";

const newsArticles = [
  {
    id: 1,
    title: "Spring Festival Celebration 2024",
    excerpt: "Join us for our annual Spring Festival featuring performances, crafts, and family activities. A wonderful opportunity for families to come together and celebrate the season.",
    date: "March 15, 2024",
    category: "Events",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    title: "New Art Studio Opening",
    excerpt: "We're excited to announce the opening of our brand new art studio, equipped with the latest creative materials and a dedicated space for young artists to explore.",
    date: "March 10, 2024",
    category: "Facilities",
    image: "/placeholder.svg",
  },
  {
    id: 3,
    title: "Parent-Teacher Conference Dates",
    excerpt: "Mark your calendars for our upcoming parent-teacher conferences. This is a great opportunity to discuss your child's progress and development.",
    date: "March 5, 2024",
    category: "Announcements",
    image: "/placeholder.svg",
  },
  {
    id: 4,
    title: "Nature Discovery Week Success",
    excerpt: "Our Nature Discovery Week was a huge success! Children explored the outdoors, learned about plants and animals, and developed a deeper connection with nature.",
    date: "February 28, 2024",
    category: "Activities",
    image: "/placeholder.svg",
  },
  {
    id: 5,
    title: "Summer Camp Registration Open",
    excerpt: "Registration for our exciting Summer Camp program is now open! Secure your child's spot for a summer filled with fun, learning, and adventure.",
    date: "February 20, 2024",
    category: "Programs",
    image: "/placeholder.svg",
  },
  {
    id: 6,
    title: "Health & Safety Updates",
    excerpt: "Learn about our latest health and safety protocols to ensure a secure and healthy environment for all our little stars.",
    date: "February 15, 2024",
    category: "Announcements",
    image: "/placeholder.svg",
  },
];

const categoryColors: Record<string, string> = {
  Events: "bg-accent text-accent-foreground",
  Facilities: "bg-secondary text-secondary-foreground",
  Announcements: "bg-primary text-primary-foreground",
  Activities: "bg-muted text-muted-foreground",
  Programs: "bg-accent text-accent-foreground",
};

const News = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-secondary/30 to-background">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <motion.span
                  className="inline-block px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-medium mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  Stay Updated
                </motion.span>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                  News & Updates
                </h1>
                <p className="font-body text-lg text-muted-foreground">
                  Stay informed about the latest happenings, events, and announcements 
                  from Little Stars Kindergarten.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* News Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsArticles.map((article, index) => (
                <ScrollReveal key={article.id} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full overflow-hidden group cursor-pointer border-2 border-transparent hover:border-accent/30 transition-colors">
                      <div className="aspect-video bg-muted overflow-hidden">
                        <motion.img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={categoryColors[article.category] || "bg-muted"}>
                            {article.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{article.date}</span>
                          </div>
                        </div>
                        <CardTitle className="font-display text-xl group-hover:text-accent transition-colors line-clamp-2">
                          {article.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-3 mb-4">
                          {article.excerpt}
                        </p>
                        <Button
                          variant="ghost"
                          className="p-0 h-auto text-accent hover:text-accent/80 group/btn"
                        >
                          Read More
                          <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                  Never Miss an Update
                </h2>
                <p className="text-muted-foreground mb-6">
                  Subscribe to our newsletter to receive the latest news and updates 
                  directly in your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent w-full sm:w-80"
                  />
                  <Button variant="playful" size="lg">
                    Subscribe
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default News;
