import { motion } from "framer-motion";
import { Apple, Coffee, Utensils, Cookie, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerChildren, { itemVariants } from "@/components/animations/StaggerChildren";

const weeklyMenu = [
  {
    day: "Monday",
    meals: {
      breakfast: "Oatmeal with fresh berries",
      snack: "Apple slices with yogurt",
      lunch: "Grilled chicken with mashed potatoes and steamed vegetables",
      afternoonSnack: "Whole grain crackers with cheese",
    },
  },
  {
    day: "Tuesday",
    meals: {
      breakfast: "Scrambled eggs with whole wheat toast",
      snack: "Banana and milk",
      lunch: "Pasta with tomato sauce and mixed salad",
      afternoonSnack: "Fruit smoothie",
    },
  },
  {
    day: "Wednesday",
    meals: {
      breakfast: "Pancakes with honey and fresh fruit",
      snack: "Carrot sticks with hummus",
      lunch: "Fish fillet with rice and green beans",
      afternoonSnack: "Yogurt parfait",
    },
  },
  {
    day: "Thursday",
    meals: {
      breakfast: "Cornflakes with milk and banana",
      snack: "Orange slices",
      lunch: "Beef stew with vegetables and bread",
      afternoonSnack: "Homemade muffin",
    },
  },
  {
    day: "Friday",
    meals: {
      breakfast: "French toast with maple syrup",
      snack: "Mixed fruit cup",
      lunch: "Pizza with vegetable toppings and salad",
      afternoonSnack: "Rice cakes with peanut butter",
    },
  },
];

const mealTypes = [
  { key: "breakfast", label: "Breakfast", icon: Coffee, color: "bg-accent" },
  { key: "snack", label: "Morning Snack", icon: Apple, color: "bg-mint" },
  { key: "lunch", label: "Lunch", icon: Utensils, color: "bg-secondary" },
  { key: "afternoonSnack", label: "Afternoon Snack", icon: Cookie, color: "bg-primary" },
];

const WeeklyMenu = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-mint/20 to-background relative overflow-hidden">
          <motion.div
            className="absolute top-10 right-20 w-24 h-24 bg-accent/20"
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
            className="absolute bottom-10 left-10 w-32 h-32 bg-primary/20"
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
              <span className="inline-block font-body font-medium text-mint bg-mint/20 px-4 py-1 rounded-full mb-4">
                Weekly Menu
              </span>
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Healthy & <span className="text-accent">Delicious</span> Meals
              </h1>
              <p className="font-body text-lg text-muted-foreground">
                We provide nutritious, balanced meals prepared fresh daily with love and care. 
                Our menu is designed to support healthy growth and development.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Menu Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6" staggerDelay={0.1}>
              {weeklyMenu.map((dayMenu) => (
                <motion.div
                  key={dayMenu.day}
                  variants={itemVariants}
                  className="bg-card rounded-3xl p-6 shadow-lg border-2 border-transparent hover:border-primary/30 transition-all duration-300"
                >
                  <motion.h3
                    className="font-display font-bold text-xl text-foreground mb-6 text-center pb-4 border-b border-border"
                    whileHover={{ scale: 1.05 }}
                  >
                    {dayMenu.day}
                  </motion.h3>

                  <div className="space-y-4">
                    {mealTypes.map((mealType) => (
                      <div key={mealType.key} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 ${mealType.color} rounded-lg flex items-center justify-center`}>
                            <mealType.icon className="w-4 h-4 text-foreground" />
                          </div>
                          <span className="font-semibold text-sm text-foreground">{mealType.label}</span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-10">
                          {dayMenu.meals[mealType.key as keyof typeof dayMenu.meals]}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* Dietary Notes */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <ScrollReveal className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
                Important <span className="text-secondary">Information</span>
              </h2>
            </ScrollReveal>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Allergy Accommodations",
                  description: "We accommodate all dietary restrictions and allergies. Please inform us of any special requirements during enrollment.",
                  color: "bg-accent",
                },
                {
                  title: "Fresh Ingredients",
                  description: "All meals are prepared fresh daily using locally sourced, high-quality ingredients.",
                  color: "bg-mint",
                },
                {
                  title: "Vegetarian Options",
                  description: "Vegetarian alternatives are available for all meals upon request.",
                  color: "bg-secondary",
                },
                {
                  title: "Menu Updates",
                  description: "Our menu may vary seasonally to incorporate fresh, seasonal produce.",
                  color: "bg-primary",
                },
              ].map((note) => (
                <ScrollReveal key={note.title}>
                  <motion.div
                    className="bg-background rounded-2xl p-6 shadow-sm flex gap-4"
                    whileHover={{ y: -5 }}
                  >
                    <div className={`w-12 h-12 ${note.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <AlertCircle className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground mb-2">{note.title}</h3>
                      <p className="text-sm text-muted-foreground">{note.description}</p>
                    </div>
                  </motion.div>
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

export default WeeklyMenu;
