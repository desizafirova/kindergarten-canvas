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
    title: "Изпратете запитване",
    description: "Попълнете нашата онлайн форма за запитване или ни се обадете, за да изразите интереса си. Ще отговорим в рамките на 24 часа.",
    icon: ClipboardList,
    color: "bg-accent",
  },
  {
    step: 2,
    title: "Запишете посещение",
    description: "Посетете нашето заведение, за да се запознаете с учителите ни, да видите занималните и да изпитате нашата учебна среда.",
    icon: Calendar,
    color: "bg-secondary",
  },
  {
    step: 3,
    title: "Попълнете заявление",
    description: "Подайте пълния формуляр за кандидатстване заедно с всички необходими документи, изброени по-долу.",
    icon: FileText,
    color: "bg-mint",
  },
  {
    step: 4,
    title: "Среща с родители",
    description: "Срещнете се с нашия директор, за да обсъдите нуждите на детето си, вашите очаквания и да отговорите на въпроси.",
    icon: Phone,
    color: "bg-primary",
  },
  {
    step: 5,
    title: "Потвърждение на записването",
    description: "Получете писмо за приемане и завършете процеса на записване с плащане на регистрационните такси.",
    icon: UserCheck,
    color: "bg-purple",
  },
];

const requiredDocuments = [
  {
    category: "Документи на детето",
    items: [
      "Акт за раждане (оригинал и копие)",
      "Снимки паспортен формат (4 броя)",
      "Имунизационен паспорт",
      "Скорошен здравен преглед",
      "Предишни училищни документи (ако има)",
    ],
  },
  {
    category: "Документи на родителя",
    items: [
      "Копия на лични карти на родител/настойник",
      "Доказателство за адрес (сметка или банково извлечение)",
      "Информация за спешен контакт",
      "Списък с упълномощени лица за вземане със снимки",
    ],
  },
  {
    category: "Медицинска информация",
    items: [
      "Формуляр за алергии",
      "Формуляр за медицинско разрешение",
      "Документация за специални нужди (ако има)",
      "Формуляр за прилагане на лекарства (ако е необходимо)",
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
                Присъединете се към нас
              </span>
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Процес на <span className="text-primary">прием</span>
              </h1>
              <p className="font-body text-lg text-muted-foreground">
                Радваме се, че обмисляте ДГ №48 „Ран Босилек" за вашето дете!
                Ето всичко, което трябва да знаете, за да се присъедините към нашето семейство.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Admission Steps */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <ScrollReveal className="text-center mb-16">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
                Лесен процес в <span className="text-accent">5 стъпки</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Нашият опростен процес на прием е проектиран да бъде без стрес за заетите родители.
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
                        <span className="text-sm font-semibold text-muted-foreground">Стъпка {step.step}</span>
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
                Необходими <span className="text-secondary">документи</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Моля, подгответе следните документи преди срещата за кандидатстване.
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
                    Важни дати
                  </h3>
                  <ul className="space-y-4">
                    {[
                      { label: "Отворен прием", value: "15 януари - 30 март" },
                      { label: "Късен прием", value: "1 април - 15 май" },
                      { label: "Начало на учебната година", value: "15 септември" },
                      { label: "Ден за ориентация", value: "10 септември" },
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
                    Такси
                  </h3>
                  <ul className="space-y-4">
                    {[
                      { label: "Регистрационна такса", value: "50 лв. (еднократно)" },
                      { label: "Месечна такса", value: "От 150 лв./месец" },
                      { label: "Такса за материали", value: "100 лв./година" },
                      { label: "Удължена грижа", value: "10 лв./час" },
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
                Готови да започнете?
              </h2>
              <p className="text-white/90 mb-8 max-w-xl mx-auto">
                Свържете се с нас днес, за да запишете посещение или да изпратите запитване.
                Нямаме търпение да приветстваме вашата малка звезда в нашето семейство!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" variant="secondary" className="font-display">
                  Запишете посещение
                </Button>
                <Button size="xl" variant="outline" className="bg-white/10 border-white text-white hover:bg-white hover:text-primary font-display">
                  <Download className="w-5 h-5 mr-2" />
                  Изтегли формуляри
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
