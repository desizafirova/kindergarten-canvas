import { motion } from "framer-motion";
import { Calendar, ArrowRight, Newspaper } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerChildren, { itemVariants } from "@/components/animations/StaggerChildren";

const newsArticles = [
  {
    id: 1,
    title: "Празник на пролетта 2024",
    excerpt: "Присъединете се към годишния ни пролетен празник с представления, занаяти и семейни дейности. Прекрасна възможност семействата да се съберат и да отпразнуват сезона.",
    date: "15 март 2024",
    category: "Събития",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    title: "Откриване на ново арт студио",
    excerpt: "С вълнение съобщаваме за откриването на нашето чисто ново арт студио, оборудвано с най-новите творчески материали и специално пространство за млади художници.",
    date: "10 март 2024",
    category: "Съоръжения",
    image: "/placeholder.svg",
  },
  {
    id: 3,
    title: "Дати за родителски срещи",
    excerpt: "Отбележете в календарите си предстоящите родителски срещи. Това е чудесна възможност да обсъдите напредъка и развитието на вашето дете.",
    date: "5 март 2024",
    category: "Съобщения",
    image: "/placeholder.svg",
  },
  {
    id: 4,
    title: "Успешна седмица за откриване на природата",
    excerpt: "Нашата Седмица за откриване на природата беше голям успех! Децата изследваха на открито, научиха за растенията и животните и развиха по-дълбока връзка с природата.",
    date: "28 февруари 2024",
    category: "Дейности",
    image: "/placeholder.svg",
  },
  {
    id: 5,
    title: "Записването за летен лагер е отворено",
    excerpt: "Записването за нашата вълнуваща програма за летен лагер вече е отворено! Осигурете място на детето си за лято, пълно със забавления, учене и приключения.",
    date: "20 февруари 2024",
    category: "Програми",
    image: "/placeholder.svg",
  },
  {
    id: 6,
    title: "Актуализации за здраве и безопасност",
    excerpt: "Научете за най-новите ни протоколи за здраве и безопасност, за да осигурим сигурна и здравословна среда за всички наши малки звезди.",
    date: "15 февруари 2024",
    category: "Съобщения",
    image: "/placeholder.svg",
  },
];

const categoryColors = {
  "Събития": "bg-accent text-accent-foreground",
  "Съоръжения": "bg-secondary text-secondary-foreground",
  "Съобщения": "bg-primary text-primary-foreground",
  "Дейности": "bg-mint text-foreground",
  "Програми": "bg-sky text-foreground",
};

const News = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-accent/10 via-secondary/20 to-background relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-blob animate-float" />
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-secondary/30 rounded-blob animate-bounce-slow" />
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-accent/20 rounded-blob animate-wiggle" />

          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <motion.div
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent/20 text-accent rounded-full text-sm font-medium mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <Newspaper className="w-4 h-4" />
                  Бъдете информирани
                </motion.div>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  Новини и{" "}
                  <span className="text-accent">актуалности</span>
                </h1>
                <p className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Бъдете информирани за последните събития, мероприятия и съобщения
                  от ДГ №48 „Ран Босилек".
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* News Grid */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsArticles.map((article) => (
                <motion.div key={article.id} variants={itemVariants}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full overflow-hidden group cursor-pointer border-2 border-border hover:border-accent/40 transition-all duration-300 hover:shadow-xl hover:shadow-accent/10 rounded-2xl">
                      <div className="aspect-video bg-muted overflow-hidden">
                        <motion.img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={`${categoryColors[article.category] || "bg-muted"} rounded-full px-3 py-1 text-xs font-semibold`}>
                            {article.category}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{article.date}</span>
                          </div>
                        </div>
                        <CardTitle className="font-display text-xl group-hover:text-accent transition-colors line-clamp-2">
                          {article.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                          {article.excerpt}
                        </p>
                        <Button
                          variant="ghost"
                          className="p-0 h-auto text-accent hover:text-accent/80 font-semibold group/btn"
                        >
                          Прочети още
                          <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-secondary/30 via-mint/20 to-primary/10 relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-5 right-20 w-20 h-20 bg-accent/15 rounded-blob animate-float" />
          <div className="absolute bottom-5 left-16 w-28 h-28 bg-primary/15 rounded-blob animate-bounce-slow" />

          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal>
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Никога не пропускайте{" "}
                  <span className="text-accent">новина</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Абонирайте се за нашия бюлетин, за да получавате последните новини и актуалности
                  директно в пощата си.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <input
                    type="email"
                    placeholder="Въведете вашия имейл"
                    className="px-6 py-3 rounded-full border-2 border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent w-full sm:w-80 font-body transition-all"
                  />
                  <Button variant="playful" size="lg" className="rounded-full">
                    Абонирай се
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
