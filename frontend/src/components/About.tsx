import { motion } from "framer-motion";
import { Shield, Heart, Lightbulb, Award } from "lucide-react";
import ScrollReveal from "./animations/ScrollReveal";
import StaggerChildren, { itemVariants } from "./animations/StaggerChildren";

const values = [
  {
    icon: Shield,
    title: "Безопасна среда",
    description: "Сигурни, приятелски за децата пространства, проектирани с безопасността като наш приоритет.",
    color: "text-secondary",
    bg: "bg-secondary/20",
  },
  {
    icon: Heart,
    title: "Грижовност",
    description: "Топли, грижовни учители, които се отнасят към всяко дете с доброта и разбиране.",
    color: "text-accent",
    bg: "bg-accent/20",
  },
  {
    icon: Lightbulb,
    title: "Творческо обучение",
    description: "Иновативни методи на преподаване, които правят ученето забавно и събуждат любопитство.",
    color: "text-primary",
    bg: "bg-primary/20",
  },
  {
    icon: Award,
    title: "Високи стандарти",
    description: "Ангажирани с най-високите стандарти в ранното детско образование и развитие.",
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
          <ScrollReveal direction="left" className="space-y-6">
            <span className="inline-block font-body font-medium text-mint bg-mint/20 px-4 py-1 rounded-full">
              За нас
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-foreground">
              Място, където <span className="text-secondary">мечтите</span> полетят
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              Вече над 15 години ДГ №48 „Ран Босилек" е доверен партньор в ранното
              детско образование. Нашият подход, базиран на игра, помага на децата да
              развият важни умения, докато се забавляват и изграждат трайни приятелства.
            </p>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              Вярваме, че всяко дете е уникално и заслужава среда, която празнува
              неговата индивидуалност, докато го подготвя за вълнуващото пътешествие напред.
            </p>

            {/* Feature List */}
            <ul className="space-y-3 pt-4">
              {[
                "Малки групи за персонално внимание",
                "Сертифицирани и опитни педагози",
                "Модерни учебни съоръжения и ресурси",
                "Редовна комуникация и участие на родителите",
              ].map((item, i) => (
                <motion.li
                  key={i}
                  className="flex items-center gap-3 font-body text-foreground"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                >
                  <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-sm">✓</span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </ScrollReveal>

          {/* Right - Values Grid */}
          <StaggerChildren className="grid grid-cols-2 gap-4 lg:gap-6" staggerDelay={0.15}>
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className={`${value.bg} rounded-3xl p-6 text-center cursor-default`}
              >
                <motion.div
                  className={`w-14 h-14 ${value.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                  whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
                >
                  <value.icon className={`w-7 h-7 ${value.color}`} />
                </motion.div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>

        {/* Location & Community Section */}
        <div className="mt-20 pt-16 border-t border-border">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left" className="space-y-6">
              <span className="inline-block font-body font-medium text-primary bg-primary/20 px-4 py-1 rounded-full">
                Нашето местоположение
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-foreground">
                В сърцето на <span className="text-mint">общността</span>
              </h2>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Разположена в спокоен, приятелски за семействата квартал, ДГ №48 „Ран Босилек"
                предлага перфектната среда за ранно учене. Нашето местоположение осигурява лесен
                достъп за семействата, като поддържа безопасна, грижовна атмосфера.
              </p>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Гордеем се, че сме активна част от местната общност, като си партнираме с
                близки училища, библиотеки и организации за обогатяване на преживяванията на децата.
              </p>
            </ScrollReveal>

            <StaggerChildren className="grid grid-cols-2 gap-4" staggerDelay={0.1}>
              {[
                {
                  title: "Градски парк",
                  description: "5 минути пеша до местния парк за дейности сред природата",
                  icon: "🌳",
                  bg: "bg-mint/20",
                },
                {
                  title: "Библиотека",
                  description: "Ежемесечни посещения за приказки и разглеждане на книги",
                  icon: "📚",
                  bg: "bg-primary/20",
                },
                {
                  title: "Обществен транспорт",
                  description: "Автобусни спирки наблизо за удобен достъп на родителите",
                  icon: "🚌",
                  bg: "bg-secondary/20",
                },
                {
                  title: "Начални училища",
                  description: "Близо до отлични училища за лесен преход",
                  icon: "🏫",
                  bg: "bg-accent/20",
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  className={`${item.bg} rounded-2xl p-5 cursor-default`}
                >
                  <span className="text-3xl mb-3 block">{item.icon}</span>
                  <h3 className="font-display font-bold text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>

          {/* Address Card */}
          <ScrollReveal className="mt-12">
            <motion.div
              className="bg-card rounded-3xl p-8 shadow-lg border border-border max-w-2xl mx-auto text-center"
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📍</span>
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                Посетете ни
              </h3>
              <p className="font-body text-muted-foreground mb-4">
                ул. „Слънчева" №123, София<br />
                Отворено понеделник - петък, 7:30 - 18:00
              </p>
              <p className="font-body text-sm text-primary">
                Запишете посещение днес и вижте нашите прекрасни съоръжения!
              </p>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default About;
