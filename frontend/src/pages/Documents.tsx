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
    title: "Програмна система",
    icon: BookOpen,
    color: "bg-primary",
    description: "Нашата образователна философия и учебна рамка",
    documents: [
      {
        title: "Преглед на образователната програма",
        description: "Изчерпателно ръководство за нашата методология на преподаване и учебни цели",
      },
      {
        title: "Учебна рамка",
        description: "Подробно разпределение на подходящи за възрастта учебни дейности и цели",
      },
      {
        title: "Етапи на развитие",
        description: "Очаквани постижения в развитието за всяка възрастова група",
      },
    ],
  },
  {
    id: "rules",
    title: "Вътрешни правила",
    icon: ScrollText,
    color: "bg-secondary",
    description: "Политики и насоки на детската градина за родители и деца",
    documents: [
      {
        title: "Наръчник за родители",
        description: "Пълно ръководство за родители, включващо процедури за оставяне/вземане и политики за комуникация",
      },
      {
        title: "Насоки за поведение",
        description: "Подход за позитивна дисциплина и очаквания за поведение",
      },
      {
        title: "Протоколи за здраве и безопасност",
        description: "Политики за заболяване, прилагане на лекарства и спешни процедури",
      },
      {
        title: "Политика за присъствие",
        description: "Насоки за присъствие, отсъствия и заявки за ваканция",
      },
    ],
  },
  {
    id: "regulations",
    title: "Наредби и съответствие",
    icon: Shield,
    color: "bg-mint",
    description: "Правни изисквания и документи за регулаторно съответствие",
    documents: [
      {
        title: "Политика за поверителност GDPR",
        description: "Как събираме, използваме и защитаваме лични данни",
      },
      {
        title: "Политика за закрила на детето",
        description: "Нашият ангажимент за защита на благосъстоянието на децата",
      },
      {
        title: "Политика за равни възможности",
        description: "Нашата отдаденост на приобщаването и недискриминацията",
      },
      {
        title: "Процедура за жалби",
        description: "Как да повдигнете притеснения и нашия процес за разрешаване",
      },
    ],
  },
  {
    id: "forms",
    title: "Формуляри и заявления",
    icon: ClipboardList,
    color: "bg-accent",
    description: "Формуляри за изтегляне за записване и разрешения",
    documents: [
      {
        title: "Заявление за записване",
        description: "Пълен формуляр за заявление за регистрация на нов ученик",
      },
      {
        title: "Формуляр за медицинска информация",
        description: "Здравна история и данни за спешен контакт",
      },
      {
        title: "Съгласие за снимки/медии",
        description: "Разрешение за използване на снимки в промоционални материали",
      },
      {
        title: "Разрешение за екскурзии",
        description: "Общо разрешение за образователни излети",
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
                Документи и политики
              </span>
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Институционални <span className="text-secondary">документи</span>
              </h1>
              <p className="font-body text-lg text-muted-foreground">
                Достъп до нашите официални документи, политики и формуляри. Вярваме в прозрачността
                и поддържането на информираност на родителите за всички аспекти на нашата детска градина.
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
                                Преглед
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
                Нуждаете се от конкретен документ?
              </h2>
              <p className="text-muted-foreground mb-6">
                Ако не можете да намерите това, което търсите, моля свържете се с нашия административен
                офис и ще се радваме да ви помогнем.
              </p>
              <Button variant="playful" size="lg">
                Свържете се с администрацията
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
