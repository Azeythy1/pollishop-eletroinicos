import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingCart, Battery, Wrench, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface Photo {
  id: number;
  url: string;
  isPrimary: boolean;
}

interface CatalogItem {
  id: number;
  model: string;
  storage: string | null;
  color?: string | null;
  cashPrice: number;
  condition: string;
  batteryHealth: number | null;
  repairs?: string | null;
  category?: string;
  processor?: string;
  ram?: string;
  gpu?: string;
  screen?: string;
  brand?: string;
  itemType?: string;
  specifications?: string;
  compatibility?: string;
  photos: Photo[];
  installmentOptions: Array<{
    installments: number;
    rate: number;
    perInstallment: number;
    total: number;
  }>;
}

interface ProductModalProps {
  product: CatalogItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CatalogItem) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photos = product.photos.length > 0 ? product.photos : [];
  const currentPhoto = photos[currentPhotoIndex];

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const installment12x = product.installmentOptions.find(opt => opt.installments === 12);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{product.model} {product.storage}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photo Carousel */}
          <div className="space-y-4">
            <div className="relative w-full bg-muted rounded-lg overflow-hidden aspect-square">
              {currentPhoto ? (
                <motion.img
                  key={currentPhotoIndex}
                  src={currentPhoto.url}
                  alt={`${product.model} - Foto ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-muted-foreground">Sem fotos</span>
                </div>
              )}

              {/* Navigation Arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Photo Counter */}
              {photos.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {currentPhotoIndex + 1} / {photos.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentPhotoIndex
                        ? "border-primary ring-2 ring-primary/50"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Price Section */}
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">À vista</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(product.cashPrice)}</p>
              </div>

              {installment12x && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-600 font-medium">Ou 12x de</p>
                  <p className="text-xl font-bold text-blue-700">{formatCurrency(installment12x.perInstallment)}</p>
                </div>
              )}
            </div>

            {/* Condition & Battery */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Condição</p>
                  <p className="font-semibold text-foreground">{product.condition}</p>
                </div>
              </div>

              {product.batteryHealth && (
                <div className="flex items-center gap-2">
                  <Battery className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Saúde da Bateria</p>
                    <p className="font-semibold text-foreground">{product.batteryHealth}</p>
                  </div>
                </div>
              )}

              {product.repairs && (
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Histórico de Reparos</p>
                    <p className="font-semibold text-foreground">{product.repairs}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Category-Specific Details */}
            <div className="space-y-3 border-t border-border pt-4">
              {product.processor && (
                <div>
                  <p className="text-sm text-muted-foreground">Processador</p>
                  <p className="font-semibold text-foreground">{product.processor}</p>
                </div>
              )}

              {product.ram && (
                <div>
                  <p className="text-sm text-muted-foreground">Memória RAM</p>
                  <p className="font-semibold text-foreground">{product.ram}</p>
                </div>
              )}

              {product.gpu && (
                <div>
                  <p className="text-sm text-muted-foreground">Placa de Vídeo</p>
                  <p className="font-semibold text-foreground">{product.gpu}</p>
                </div>
              )}

              {product.screen && (
                <div>
                  <p className="text-sm text-muted-foreground">Tela</p>
                  <p className="font-semibold text-foreground">{product.screen}</p>
                </div>
              )}

              {product.brand && (
                <div>
                  <p className="text-sm text-muted-foreground">Marca</p>
                  <p className="font-semibold text-foreground">{product.brand}</p>
                </div>
              )}

              {product.specifications && (
                <div>
                  <p className="text-sm text-muted-foreground">Especificações</p>
                  <p className="font-semibold text-foreground">{product.specifications}</p>
                </div>
              )}

              {product.compatibility && (
                <div>
                  <p className="text-sm text-muted-foreground">Compatibilidade</p>
                  <p className="font-semibold text-foreground">{product.compatibility}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Fechar
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Adicionar ao Carrinho
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
