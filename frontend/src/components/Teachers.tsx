import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Star, Music, Palette, User } from "lucide-react";
import ScrollReveal from "./animations/ScrollReveal";
import StaggerChildren, { itemVariants } from "./animations/StaggerChildren";
import api from "@/lib/api";

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  bio: string | null;
  photoUrl: string | null;
  displayOrder: number | null;
}

// Helper function to get icon and color based on position
const getTeacherStyle = (position: string, index: number) => {
  const lowerPosition = position.toLowerCase();

  if (lowerPosition.includes('главен') || lowerPosition.includes('директор')) {
    return { icon: <Star className="w-5 h-5" />, color: "bg-primary" };
  } else if (lowerPosition.includes('stem') || lowerPosition.includes('наука')) {
    return { icon: <Heart className="w-5 h-5" />, color: "bg-secondary" };
  } else if (lowerPosition.includes('изкуство') || lowerPosition.includes('рисуване')) {
    return { icon: <Palette className="w-5 h-5" />, color: "bg-accent" };
  } else if (lowerPosition.includes('музика') || lowerPosition.includes('движение')) {
    return { icon: <Music className="w-5 h-5" />, color: "bg-mint" };
  } else {
    // Cycle through colors for other positions
    const colors = ["bg-primary", "bg-secondary", "bg-accent", "bg-mint"];
    return { icon: <User className="w-5 h-5" />, color: colors[index % colors.length] };
  }
};

// Helper to get teacher initials for placeholder
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const response = await api.get('/api/v1/public/teachers');

        if (response.data.status === 'success') {
          setTeachers(response.data.data.teachers);
        } else {
          setIsError(true);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Don't render the section if there are no teachers and not loading
  if (!isLoading && !isError && teachers.length === 0) {
    return null;
  }

  return (
    <section id="teachers" className="py-20 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-20 h-20 bg-purple/30 rounded-blob animate-blob" />
      <div className="absolute bottom-32 left-10 w-28 h-28 bg-secondary/20 rounded-blob animate-blob" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-mint/20 rounded-full animate-float" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple/30 text-purple-foreground rounded-full text-sm font-medium mb-4">
              👩‍🏫 Нашият невероятен екип
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Запознайте се с нашите <span className="text-secondary">учители</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Нашите отдадени педагози носят топлина, експертиза и безкрайно творчество, за да помогнат на вашите малчугани да растат и да процъфтяват!
            </p>
          </div>
        </ScrollReveal>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Зареждане на учители...</p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-600">Грешка при зареждане на учителите. Моля, опитайте по-късно.</p>
          </div>
        )}

        {/* Teachers Grid */}
        {!isLoading && !isError && teachers.length > 0 && (
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teachers.map((teacher, index) => {
              const fullName = `${teacher.firstName} ${teacher.lastName}`;
              const { icon, color } = getTeacherStyle(teacher.position, index);

              return (
                <motion.div
                  key={teacher.id}
                  variants={itemVariants}
                  className="group"
                >
                  <div className="relative bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    {/* Image container with overlay */}
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                      {teacher.photoUrl ? (
                        <img
                          src={teacher.photoUrl}
                          alt={`${fullName} - ${teacher.position}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                          <div className="text-center">
                            <div className="text-6xl font-bold text-gray-400 mb-2">
                              {getInitials(teacher.firstName, teacher.lastName)}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

                      {/* Role badge */}
                      {teacher.position && (
                        <motion.div
                          className={`absolute top-4 right-4 ${color} text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          {icon}
                          <span>{teacher.position}</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 relative">
                      {/* Decorative corner blob */}
                      <div className={`absolute -top-6 left-6 w-12 h-12 ${color}/20 rounded-blob`} />

                      <h3 className="text-xl font-display font-bold text-foreground mb-2 relative z-10">
                        {fullName}
                      </h3>
                      {teacher.bio && (
                        <div
                          className="text-muted-foreground text-sm leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: teacher.bio }}
                        />
                      )}

                      {/* Hover effect line */}
                      <motion.div
                        className={`h-1 ${color} rounded-full mt-4 origin-left`}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </StaggerChildren>
        )}

        {/* Fun fact callout */}
        <ScrollReveal delay={0.4}>
          <motion.div
            className="mt-16 text-center bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-3xl p-8 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute top-4 left-8 text-4xl animate-bounce-slow">🌟</div>
            <div className="absolute bottom-4 right-8 text-4xl animate-wiggle">💖</div>
            
            <h3 className="text-2xl font-display font-bold text-foreground mb-2">
              Обещанието на нашия екип
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Всеки член на нашия екип е проверен, сертифициран за първа помощ и отдаден да осигури безопасна, грижовна среда, където децата могат да процъфтяват.
            </p>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Teachers;
