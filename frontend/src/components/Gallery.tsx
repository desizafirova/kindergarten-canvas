import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ScrollReveal from "./animations/ScrollReveal";
import StaggerChildren, { itemVariants } from "./animations/StaggerChildren";

import classroom1 from "@/assets/gallery/classroom-1.jpg";
import classroom2 from "@/assets/gallery/classroom-2.jpg";
import outdoor1 from "@/assets/gallery/outdoor-1.jpg";
import outdoor2 from "@/assets/gallery/outdoor-2.jpg";
import activity1 from "@/assets/gallery/activity-1.jpg";
import activity2 from "@/assets/gallery/activity-2.jpg";

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: string;
  span: "normal" | "tall" | "wide";
}

const galleryImages: GalleryImage[] = [
  { id: 1, src: classroom1, alt: "Светла и цветна класна стая", category: "Занималня", span: "tall" },
  { id: 2, src: outdoor1, alt: "Забавна детска площадка", category: "На открито", span: "normal" },
  { id: 3, src: activity1, alt: "Изкуство и занаяти", category: "Дейности", span: "normal" },
  { id: 4, src: classroom2, alt: "Кът за четене с книги", category: "Занималня", span: "normal" },
  { id: 5, src: outdoor2, alt: "Градина за изследване", category: "На открито", span: "tall" },
  { id: 6, src: activity2, alt: "Музика и танци", category: "Дейности", span: "normal" },
];

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [filter, setFilter] = useState<string>("All");

  const categories = ["Всички", "Занималня", "На открито", "Дейности"];

  const filteredImages = filter === "Всички"
    ? galleryImages
    : galleryImages.filter(img => img.category === filter);

  return (
    <section id="gallery" className="py-20 bg-secondary/20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-primary/20 rounded-blob animate-float" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/20 rounded-blob animate-float" style={{ animationDelay: "1s" }} />
      
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-mint/30 text-mint-foreground rounded-full text-sm font-medium mb-4">
              📸 Нашата галерия
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Надникнете в нашия <span className="text-primary">свят</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Направете виртуална обиколка на нашите живи пространства, където малчуганите учат, играят и растат заедно!
            </p>
          </div>
        </ScrollReveal>

        {/* Category Filter */}
        <ScrollReveal delay={0.2}>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  filter === category
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-card text-card-foreground hover:bg-primary/20"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </ScrollReveal>

        {/* Masonry Grid */}
        <StaggerChildren className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image) => (
              <motion.div
                key={image.id}
                variants={itemVariants}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                className={`break-inside-avoid group cursor-pointer ${
                  image.span === "tall" ? "row-span-2" : ""
                }`}
                onClick={() => setSelectedImage(image)}
              >
                <div className="relative overflow-hidden rounded-2xl bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                      image.span === "tall" ? "h-80 sm:h-96" : "h-48 sm:h-64"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full mb-2">
                      {image.category}
                    </span>
                    <p className="text-white font-medium">{image.alt}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </StaggerChildren>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-16 left-0 right-0 text-center">
                <span className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium">
                  {selectedImage.category}
                </span>
                <p className="text-white mt-2">{selectedImage.alt}</p>
              </div>
              <motion.button
                className="absolute -top-4 -right-4 w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
