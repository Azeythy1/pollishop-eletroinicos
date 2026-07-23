import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const GALLERY_IMAGES = [
  {
    id: 1,
    title: "Moda Íntima Premium",
    description: "Coleção exclusiva de lingerie e cuecas",
    color: "from-rose-500 to-pink-500",
  },
  {
    id: 2,
    title: "Fitness & Esportes",
    description: "Roupas confortáveis para seus treinos",
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: 3,
    title: "Eletrônicos",
    description: "Produtos tecnológicos de qualidade",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 4,
    title: "Vestiário Variado",
    description: "Peças para todos os estilos",
    color: "from-amber-500 to-orange-500",
  },
];

export function GalleryCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
  };

  const currentImage = GALLERY_IMAGES[currentIndex];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-background border-b border-border">
      <div className="container relative py-12 md:py-20">
        <div className="relative">
          {/* Carrossel Principal */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`relative w-full h-80 md:h-96 rounded-2xl overflow-hidden bg-gradient-to-br ${currentImage.color} shadow-2xl`}
          >
            {/* Conteúdo */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                  {currentImage.title}
                </h2>
                <p className="text-lg md:text-xl text-white/90 drop-shadow-md">
                  {currentImage.description}
                </p>
              </motion.div>
            </div>

            {/* Overlay gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </motion.div>

          {/* Botões de Navegação */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all backdrop-blur-sm"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all backdrop-blur-sm"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {GALLERY_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? "bg-white w-8"
                    : "bg-white/50 w-2 hover:bg-white/75"
                }`}
                aria-label={`Ir para imagem ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Informações Adicionais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">✨</div>
            <h3 className="font-semibold text-foreground mb-1">Qualidade Premium</h3>
            <p className="text-sm text-muted-foreground">Produtos selecionados com cuidado</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">🚚</div>
            <h3 className="font-semibold text-foreground mb-1">Entrega Rápida</h3>
            <p className="text-sm text-muted-foreground">Compre com segurança via WhatsApp</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">💬</div>
            <h3 className="font-semibold text-foreground mb-1">Atendimento</h3>
            <p className="text-sm text-muted-foreground">Suporte direto no WhatsApp</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
