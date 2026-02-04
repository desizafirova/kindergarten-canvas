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

const categoryColors: Record<string, string> = {
  "Събития": "bg-accent text-accent-foreground",
  "Съоръжения": "bg-secondary text-secondary-foreground",
  "Съобщения": "bg-primary text-primary-foreground",
  "Дейности": "bg-muted text-muted-foreground",
  "Програми": "bg-accent text-accent-foreground",
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
                  Бъдете информирани
                </motion.span>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Новини и актуалности
                </h1>
                <p className="font-body text-lg text-muted-foreground">
                  Бъдете информирани за последните събития, мероприятия и съобщения
                  от ДГ №48 „Ран Босилек".
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
                          Прочети още
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
                  Никога не пропускайте новина
                </h2>
                <p className="text-muted-foreground mb-6">
                  Абонирайте се за нашия бюлетин, за да получавате последните новини и актуалности
                  директно в пощата си.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <input
                    type="email"
                    placeholder="Въведете вашия имейл"
                    className="px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent w-full sm:w-80"
                  />
                  <Button variant="playful" size="lg">
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
