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
    title: "Главен учител в предучилищна група",
    type: "Пълен работен ден",
    location: "На място",
    department: "Образование",
    description: "Водете група от 15-18 деца на възраст 3-4 години, прилагайки нашата програма, базирана на игра, и насърчавайки любовта към ученето.",
    requirements: [
      "Бакалавърска степен по Предучилищна педагогика",
      "3+ години опит в преподаване в детска градина",
      "Държавен сертификат за преподаване",
      "Сертификат за първа помощ",
    ],
  },
  {
    title: "Помощник-учител",
    type: "Пълен работен ден",
    location: "На място",
    department: "Образование",
    description: "Подкрепяйте главните учители в ежедневните занимания, осигурявайки безопасна и грижовна среда за малките ученици.",
    requirements: [
      "Специалност в областта на детското развитие",
      "1+ година опит в грижа за деца",
      "Страст към ранното детско образование",
      "Силни комуникативни умения",
    ],
  },
  {
    title: "Инструктор по музика и движение",
    type: "Непълен работен ден",
    location: "На място",
    department: "Обогатяване",
    description: "Проектирайте и водете увлекателни часове по музика и движение за деца на възраст 2-6 години, включващи песни, инструменти и танци.",
    requirements: [
      "Опит в музикалното образование или изпълнителските изкуства",
      "Опит в работа с малки деца",
      "Творческа и енергична личност",
      "Умение да свирите на основни инструменти",
    ],
  },
  {
    title: "Административен координатор",
    type: "Пълен работен ден",
    location: "На място",
    department: "Операции",
    description: "Управлявайте операциите на рецепцията, комуникацията с родители, процесите по записване и подкрепяйте цялостната администрация на градината.",
    requirements: [
      "2+ години административен опит",
      "Отлични организационни умения",
      "Владеене на офис софтуер",
      "Приятелско и професионално поведение",
    ],
  },
];

const benefits = [
  {
    icon: Heart,
    title: "Здраве и благополучие",
    description: "Цялостна медицинска и дентална застраховка за вас и вашето семейство",
  },
  {
    icon: GraduationCap,
    title: "Професионално развитие",
    description: "Годишен бюджет за обучение и възможности за продължаващо образование",
  },
  {
    icon: Users,
    title: "Подкрепящ екип",
    description: "Работете редом с отдадени педагози в среда на сътрудничество",
  },
  {
    icon: Sparkles,
    title: "Отстъпка за грижа за деца",
    description: "50% отстъпка от таксата за деца на служители, записани в ДГ №48",
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
                Присъединете се към екипа
              </span>
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Формирайте млади <span className="text-accent">умове</span>
              </h1>
              <p className="font-body text-lg text-muted-foreground mb-8">
                Присъединете се към нашия екип от отдадени педагози, които са страстни да правят разлика
                в живота на децата. Търсим грижовни, творчески личности, които да помогнат на малките звезди да засияят.
              </p>
              <Button variant="playful" size="xl">
                <Briefcase className="w-5 h-5 mr-2" />
                Вижте отворените позиции
              </Button>
            </ScrollReveal>
          </div>
        </section>

        {/* Why Work With Us */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <ScrollReveal className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
                Защо да работите в <span className="text-primary">ДГ №48</span>?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Вярваме в грижата не само за нашите ученици, но и за членовете на нашия екип. Ето какво ни прави специални.
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
                Отворени <span className="text-accent">позиции</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Разгледайте нашите актуални свободни позиции и намерете перфектната роля в ранното детско образование.
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
                        <Button
                          variant="playful"
                          size="sm"
                          onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Кандидатствай
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-muted-foreground mb-4">{position.description}</p>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Изисквания:</h4>
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
                Кандидатствайте <span className="text-primary">сега</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Готови да направите разлика? Попълнете формуляра за кандидатстване по-долу и се присъединете към нашия екип от отдадени педагози.
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
