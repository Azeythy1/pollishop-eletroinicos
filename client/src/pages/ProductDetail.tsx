"use client";

import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "Eletrônicos": return "📱";
    case "Vestiário": return "👕";
    case "Fitness": return "💪";
    case "Moda Íntima": return "💝";
    case "Variados": return "📦";
    default: return "📦";
  }
}

export default function ProductDetail() {
  const [, params] = useRoute("/produto/:id");
  const id = parseInt(params?.id ?? "0");
  const [photoIdx, setPhotoIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: item, isLoading } = trpc.catalog.getById.useQuery({ id }, { enabled: !!id });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">📦</div>
        <h2 className="text-xl font-semibold">Produto não encontrado</h2>
        <Link href="/"><Button variant="outline">Voltar ao catálogo</Button></Link>
      </div>
    );
  }

  const photos = item.photos;
  const currentPhoto = photos[photoIdx];

  const handleShare = () => {
    const text = `Confira este produto: ${item.model} - ${formatCurrency(item.cashPrice)}`;
    const url = window.location.href;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleAddToCart = () => {
    toast.success(`${item.model} adicionado ao carrinho!`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-foreground">{item.model}</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              className={isFavorite ? "text-destructive" : ""}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fotos */}
          <div className="space-y-4">
            {/* Foto Principal */}
            <motion.div
              key={photoIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative w-full aspect-square bg-muted rounded-xl overflow-hidden"
            >
              {currentPhoto ? (
                <img
                  src={currentPhoto.url}
                  alt={`${item.model} - foto ${photoIdx + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-6xl">{getCategoryIcon(item.category)}</div>
                </div>
              )}

              {/* Navegação */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setPhotoIdx((prev) => (prev - 1 + photos.length) % photos.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPhotoIdx((prev) => (prev + 1) % photos.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {photoIdx + 1} / {photos.length}
                  </div>
                </>
              )}
            </motion.div>

            {/* Miniaturas */}
            {photos.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPhotoIdx(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      idx === photoIdx ? "border-primary" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img src={photo.url} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="space-y-6">
            {/* Categoria e Status */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {getCategoryIcon(item.category)} {item.category}
              </Badge>
              <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-600/30">
                Disponível
              </Badge>
            </div>

            {/* Título */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{item.model}</h1>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>

            {/* Preços */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Preço à Vista</p>
                <p className="text-4xl font-bold text-primary">{formatCurrency(item.cashPrice)}</p>
              </div>

              {/* Parcelamento */}
              {item.installmentOptions && item.installmentOptions.length > 0 && (
                <div className="pt-4 border-t border-primary/20">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Parcelamento</p>
                  <div className="space-y-2">
                    {item.installmentOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{opt.installments}x</span>
                        <span className="font-medium text-primary">{formatCurrency(opt.perInstallment)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Comprar via WhatsApp
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>

            {/* Informações Adicionais */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Sobre este produto</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>ID:</strong> {item.id}</p>
                <p><strong>Categoria:</strong> {item.category}</p>
                <p><strong>Data de Cadastro:</strong> {new Date(item.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
