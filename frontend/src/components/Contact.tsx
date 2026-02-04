import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import ScrollReveal from "./animations/ScrollReveal";

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-background relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block font-body font-medium text-purple bg-purple/20 px-4 py-1 rounded-full mb-4">
            Свържете се с нас
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            Започнете <span className="text-accent">пътешествието</span> на вашето дете
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Готови сте да дадете на вашето дете най-добрия старт? Свържете се с нас, за да
            запишете посещение или да научите повече за нашите програми.
          </p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <ScrollReveal direction="left" delay={0.1} className="space-y-6">
            <div className="bg-card rounded-3xl p-8 shadow-lg">
              <h3 className="font-display font-bold text-2xl text-foreground mb-6">
                Информация за контакт
              </h3>
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: "Адрес", value: "ул. \"Дъга\" №123, София, 1000" },
                  { icon: Phone, label: "Телефон", value: "02 123 4567" },
                  { icon: Mail, label: "Имейл", value: "info@dg48ranbosilek.bg" },
                  { icon: Clock, label: "Работно време", value: "Пон-Пет: 7:00 - 18:00" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <item.icon className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div>
                      <div className="font-body text-sm text-muted-foreground">{item.label}</div>
                      <div className="font-body font-medium text-foreground">{item.value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Fun fact card */}
            <motion.div
              className="bg-secondary/20 rounded-3xl p-6 border-2 border-secondary/30"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="text-3xl mb-2"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                🎈
              </motion.div>
              <h4 className="font-display font-bold text-lg text-foreground mb-2">
                Ден на отворените врати всеки месец!
              </h4>
              <p className="font-body text-muted-foreground">
                Присъединете се за обиколка, запознайте се с нашите учители и вижте занималните в действие.
              </p>
            </motion.div>
          </ScrollReveal>

          {/* Contact Form */}
          <ScrollReveal direction="right" delay={0.2}>
            <div className="bg-card rounded-3xl p-8 shadow-lg">
              <h3 className="font-display font-bold text-2xl text-foreground mb-6">
                Изпратете ни съобщение
              </h3>
              <form className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <label className="font-body text-sm text-muted-foreground block mb-2">
                      Име на родител
                    </label>
                    <input
                      type="text"
                      placeholder="Вашето име"
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl font-body focus:outline-none focus:border-primary transition-colors"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.35, duration: 0.4 }}
                  >
                    <label className="font-body text-sm text-muted-foreground block mb-2">
                      Възраст на детето
                    </label>
                    <input
                      type="text"
                      placeholder="напр. 3 години"
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl font-body focus:outline-none focus:border-primary transition-colors"
                    />
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <label className="font-body text-sm text-muted-foreground block mb-2">
                    Имейл адрес
                  </label>
                  <input
                    type="email"
                    placeholder="vashiat@email.com"
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl font-body focus:outline-none focus:border-primary transition-colors"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                >
                  <label className="font-body text-sm text-muted-foreground block mb-2">
                    Телефонен номер
                  </label>
                  <input
                    type="tel"
                    placeholder="0888 000 000"
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl font-body focus:outline-none focus:border-primary transition-colors"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <label className="font-body text-sm text-muted-foreground block mb-2">
                    Съобщение
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Разкажете ни за вашето дете и въпросите, които имате..."
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl font-body focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.55, duration: 0.4 }}
                >
                  <Button variant="playful" size="xl" className="w-full">
                    <Send className="w-5 h-5 mr-2" />
                    Изпрати съобщение
                  </Button>
                </motion.div>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default Contact;
