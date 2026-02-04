import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Sun, Coffee, BookOpen, Palette, Music, Apple, Moon, Sparkles, Baby, Heart, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerChildren, { itemVariants } from "@/components/animations/StaggerChildren";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ScheduleItem = {
  time: string;
  activity: string;
  description: string;
  icon: typeof Sun;
  color: string;
};

const scheduleVariants: Record<string, { label: string; icon: typeof Baby; schedule: ScheduleItem[] }> = {
  nursery: {
    label: "Ясла",
    icon: Baby,
    schedule: [
      { time: "8:00 - 8:30", activity: "Пристигане и посрещане", description: "Топло посрещане, здравен преглед и успокояване", icon: Sun, color: "bg-accent" },
      { time: "8:30 - 9:00", activity: "Свободна игра", description: "Меки играчки, сензорни материали и нежно изследване", icon: Sparkles, color: "bg-primary" },
      { time: "9:00 - 9:30", activity: "Сутрешна закуска", description: "Здравословни хапки и време за мляко", icon: Apple, color: "bg-mint" },
      { time: "9:30 - 10:30", activity: "Сензорни дейности", description: "Време по корем, сензорни кутии и тактилно изследване", icon: Palette, color: "bg-secondary" },
      { time: "10:30 - 11:00", activity: "Музика и движение", description: "Приспивни песни, нежни песнички и меко движение", icon: Music, color: "bg-sky" },
      { time: "11:00 - 11:45", activity: "Почивка", description: "Време за сън в успокояваща среда", icon: Moon, color: "bg-purple" },
      { time: "11:45 - 12:00", activity: "Тръгване", description: "Вземане от родители и споделяне на дневния отчет", icon: Sun, color: "bg-accent" },
    ],
  },
  seedlings: {
    label: "Кълнове",
    icon: Heart,
    schedule: [
      { time: "8:00 - 8:30", activity: "Пристигане и посрещане", description: "Поздрав, здравен преглед и успокояващи дейности", icon: Sun, color: "bg-accent" },
      { time: "8:30 - 9:00", activity: "Сутрешен кръг", description: "Прости песни, проверка на времето и поздрави", icon: Music, color: "bg-primary" },
      { time: "9:00 - 9:30", activity: "Здравословна закуска", description: "Хранителни закуски със социално взаимодействие", icon: Apple, color: "bg-mint" },
      { time: "9:30 - 10:30", activity: "Учене чрез игра", description: "Сензорна игра, строителни блокчета и изследване", icon: Sparkles, color: "bg-secondary" },
      { time: "10:30 - 11:30", activity: "Време навън", description: "Игра в пясъчника, разходки сред природата и свеж въздух", icon: Sun, color: "bg-sky" },
      { time: "11:30 - 12:00", activity: "Време за приказки", description: "Книжки с картинки и куклен театър", icon: BookOpen, color: "bg-purple" },
      { time: "12:00 - 12:30", activity: "Обяд", description: "Балансирано хранене в подкрепяща среда", icon: Coffee, color: "bg-accent" },
      { time: "12:30 - 13:00", activity: "Почивка и тръгване", description: "Тихо време и вземане от родители", icon: Moon, color: "bg-primary" },
    ],
  },
  butterflies: {
    label: "Пеперуди",
    icon: Sparkles,
    schedule: [
      { time: "8:00 - 8:30", activity: "Пристигане и свободна игра", description: "Топли поздрави и избор на дейности", icon: Sun, color: "bg-accent" },
      { time: "8:30 - 9:00", activity: "Сутрешен кръг", description: "Песни, календар, време и споделяне", icon: Music, color: "bg-primary" },
      { time: "9:00 - 10:00", activity: "Учебни центрове", description: "Изкуство, драматична игра, блокчета и сензорни станции", icon: BookOpen, color: "bg-secondary" },
      { time: "10:00 - 10:30", activity: "Здравословна закуска", description: "Хранителни закуски с разговор", icon: Apple, color: "bg-mint" },
      { time: "10:30 - 11:30", activity: "Игра навън", description: "Катерене, тичане, пясъчник и изследване на природата", icon: Sparkles, color: "bg-sky" },
      { time: "11:30 - 12:00", activity: "Творчески изкуства", description: "Рисуване, занаяти и творческо изразяване", icon: Palette, color: "bg-purple" },
      { time: "12:00 - 12:45", activity: "Обяд", description: "Хранене в семейна атмосфера", icon: Coffee, color: "bg-accent" },
      { time: "12:45 - 14:30", activity: "Почивка", description: "Сън за тези, които имат нужда, тихи дейности за останалите", icon: Moon, color: "bg-primary" },
      { time: "14:30 - 15:00", activity: "Следобедна закуска и тръгване", description: "Леко освежаване и вземане от родители", icon: Apple, color: "bg-secondary" },
    ],
  },
  cubs: {
    label: "Мечета",
    icon: Sparkles,
    schedule: [
      { time: "8:00 - 8:30", activity: "Пристигане и сутрешна работа", description: "Самостоятелни дейности и сутрешни рутини", icon: Sun, color: "bg-accent" },
      { time: "8:30 - 9:15", activity: "Сутрешна среща", description: "Календар, време, буква/число на деня, споделяне на новини", icon: Music, color: "bg-primary" },
      { time: "9:15 - 10:15", activity: "Грамотност и математика", description: "Структурирано учене чрез игра и дейности", icon: BookOpen, color: "bg-secondary" },
      { time: "10:15 - 10:45", activity: "Здравословна закуска", description: "Хранителна почивка с взаимодействие с връстници", icon: Apple, color: "bg-mint" },
      { time: "10:45 - 11:45", activity: "Учене навън", description: "Физически дейности, наука за природата и групови игри", icon: Sparkles, color: "bg-sky" },
      { time: "11:45 - 12:30", activity: "Творческо изразяване", description: "Художествени проекти, музика и драматична игра", icon: Palette, color: "bg-purple" },
      { time: "12:30 - 13:15", activity: "Обяд", description: "Самообслужване в семейна атмосфера", icon: Coffee, color: "bg-accent" },
      { time: "13:15 - 14:30", activity: "Тихо време", description: "Почивка, четене или тихи дейности", icon: Moon, color: "bg-primary" },
      { time: "14:30 - 15:30", activity: "Обогатяващи дейности", description: "Специални проекти, STEM и изследване", icon: Sparkles, color: "bg-secondary" },
      { time: "15:30 - 16:00", activity: "Следобедна закуска и тръгване", description: "Освежаване и комуникация с родители", icon: Apple, color: "bg-mint" },
    ],
  },
  stars: {
    label: "Звезди",
    icon: Star,
    schedule: [
      { time: "8:00 - 8:30", activity: "Пристигане и самостоятелна работа", description: "Дневник, четене и сутрешни задачи", icon: Sun, color: "bg-accent" },
      { time: "8:30 - 9:30", activity: "Сутрешна среща и календар", description: "Групова дискусия, новини и дневно планиране", icon: Music, color: "bg-primary" },
      { time: "9:30 - 10:30", activity: "Блок по грамотност", description: "Четене, писане, фонетика и езикови изкуства", icon: BookOpen, color: "bg-secondary" },
      { time: "10:30 - 11:00", activity: "Здравословна закуска", description: "Хранителна почивка и социално време", icon: Apple, color: "bg-mint" },
      { time: "11:00 - 12:00", activity: "Математика и наука", description: "Числови концепции, решаване на проблеми и експерименти", icon: Sparkles, color: "bg-sky" },
      { time: "12:00 - 12:45", activity: "Обяд", description: "Самостоятелно хранене с разговор", icon: Coffee, color: "bg-accent" },
      { time: "12:45 - 13:30", activity: "Тихо четене", description: "Самостоятелно четене и почивка", icon: Moon, color: "bg-purple" },
      { time: "13:30 - 14:30", activity: "Физическо възпитание навън", description: "Структурирани игри, спортове и активна игра", icon: Sun, color: "bg-primary" },
      { time: "14:30 - 15:30", activity: "Специални занимания", description: "Изкуство, музика, чужд език или технологии", icon: Palette, color: "bg-secondary" },
      { time: "15:30 - 16:30", activity: "Време за проекти", description: "Разширени учебни проекти и групова работа", icon: Sparkles, color: "bg-mint" },
      { time: "16:30 - 17:00", activity: "Следобедна закуска и тръгване", description: "Рефлексия, закуска и вземане от родители", icon: Apple, color: "bg-sky" },
    ],
  },
};

const groupInfo = {
  nursery: { age: "1-2 години", description: "Специализирана грижа за най-малките" },
  seedlings: { age: "2-3 години", description: "Нежно въведение в структурирана игра" },
  butterflies: { age: "3-4 години", description: "Изграждане на социални и творчески умения" },
  cubs: { age: "4-5 години", description: "Подготовка за училищен успех" },
  stars: { age: "5-6 години", description: "Интензивна предучилищна програма" },
};

const DailySchedule = () => {
  const [selectedGroup, setSelectedGroup] = useState("butterflies");
  const currentSchedule = scheduleVariants[selectedGroup];

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-secondary/20 to-background relative overflow-hidden">
          <motion.div
            className="absolute top-10 left-10 w-24 h-24 bg-primary/20"
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
            className="absolute bottom-10 right-10 w-32 h-32 bg-accent/20"
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
              <span className="inline-block font-body font-medium text-secondary bg-secondary/20 px-4 py-1 rounded-full mb-4">
                Дневна програма
              </span>
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Ден, пълен с <span className="text-primary">чудеса</span>
              </h1>
              <p className="font-body text-lg text-muted-foreground">
                Нашата внимателно планирана дневна програма балансира структурираното учене със свободна игра,
                осигурявайки академично, социално и емоционално развитие на децата.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Group Selector */}
        <section className="py-8 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-4">
              <h2 className="font-display font-semibold text-lg text-foreground">Изберете възрастова група:</h2>
              <ToggleGroup
                type="single"
                value={selectedGroup}
                onValueChange={(value) => value && setSelectedGroup(value)}
                className="flex flex-wrap justify-center gap-2"
              >
                {Object.entries(scheduleVariants).map(([key, variant]) => (
                  <ToggleGroupItem
                    key={key}
                    value={key}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300 ${
                      selectedGroup === key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:border-primary/50"
                    }`}
                  >
                    <variant.icon className="w-4 h-4" />
                    <span className="font-medium">{variant.label}</span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <motion.div
                key={selectedGroup}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <span className="text-sm text-muted-foreground">
                  {groupInfo[selectedGroup as keyof typeof groupInfo].age} • {groupInfo[selectedGroup as keyof typeof groupInfo].description}
                </span>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Schedule Timeline */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedGroup}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <StaggerChildren className="relative" staggerDelay={0.08}>
                    {/* Timeline line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-secondary transform md:-translate-x-1/2 rounded-full" />

                    {currentSchedule.schedule.map((item, index) => (
                      <motion.div
                        key={item.time}
                        variants={itemVariants}
                        className={`relative flex items-center gap-4 md:gap-8 mb-8 ${
                          index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                        }`}
                      >
                        {/* Timeline dot */}
                        <motion.div
                          className={`absolute left-8 md:left-1/2 w-4 h-4 ${item.color} rounded-full transform -translate-x-1/2 z-10 border-4 border-background`}
                          whileHover={{ scale: 1.5 }}
                        />

                        {/* Content card */}
                        <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${index % 2 === 0 ? "md:pr-8" : "md:pl-8"}`}>
                          <motion.div
                            className="bg-card rounded-2xl p-6 shadow-lg border border-border hover:border-primary/30 transition-all duration-300"
                            whileHover={{ y: -5 }}
                          >
                            <div className="flex items-start gap-4">
                              <motion.div
                                className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                              >
                                <item.icon className="w-6 h-6 text-foreground" />
                              </motion.div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm font-semibold text-primary">{item.time}</span>
                                </div>
                                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                                  {item.activity}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        {/* Spacer for alternating layout */}
                        <div className="hidden md:block md:w-[calc(50%-2rem)]" />
                      </motion.div>
                    ))}
                  </StaggerChildren>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <ScrollReveal className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
                Важни <span className="text-accent">бележки</span>
              </h2>
            </ScrollReveal>

            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Гъвкаво пристигане",
                  description: "Родителите могат да оставят децата между 7:30 - 8:30",
                  color: "bg-primary",
                },
                {
                  title: "Включено хранене",
                  description: "Закуска, обяд и две междинни закуски се предоставят ежедневно",
                  color: "bg-accent",
                },
                {
                  title: "Удължена грижа",
                  description: "Налична до 18:00 за работещи родители",
                  color: "bg-secondary",
                },
              ].map((note) => (
                <ScrollReveal key={note.title}>
                  <div className="bg-background rounded-2xl p-6 text-center shadow-sm">
                    <div className={`w-3 h-3 ${note.color} rounded-full mx-auto mb-4`} />
                    <h3 className="font-display font-semibold text-foreground mb-2">{note.title}</h3>
                    <p className="text-sm text-muted-foreground">{note.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DailySchedule;
