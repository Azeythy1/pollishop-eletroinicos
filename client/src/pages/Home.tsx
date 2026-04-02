import React from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, Battery, Wrench, ShieldCheck, LogIn, Settings, ShoppingCart, X, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import { toast } from "sonner";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden animate-pulse">
      <div className="aspect-square bg-muted shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4 shimmer" />
        <div className="h-3 bg-muted rounded w-1/2 shimmer" />
        <div className="h-8 bg-muted rounded w-full shimmer mt-4" />
      </div>
    </div>
  );
}

function BatteryBadge({ health }: { health: number }) {
  const color = health >= 85 ? "text-green-600" : health >= 70 ? "text-yellow-600" : "text-red-600";
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${color}`}>
      <Battery className="w-3.5 h-3.5" />
      {health}%
    </span>
  );
}

function ConditionBadge({ condition }: { condition: string }) {
  const map: Record<string, { label: string; class: string }> = {
    excelente: { label: "Excelente", class: "bg-green-100 text-green-700 border-green-300" },
    bom: { label: "Bom", class: "bg-blue-100 text-blue-700 border-blue-300" },
    regular: { label: "Regular", class: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  };
  const cfg = map[condition] ?? map.bom;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.class}`}>
      {cfg.label}
    </span>
  );
}

type CatalogItem = {
  id: number;
  model: string;
  storage: string | null;
  color?: string | null;
  batteryHealth: number | null;
  repairs?: string | null;
  condition: string;
  cashPrice: number;
  installmentOptions: Array<{ installments: number; rate: number; total: number; perInstallment: number }>;
  photos: Array<{ id: number; url: string; isPrimary: boolean }>;
};

type CartItem = CatalogItem & { quantity: number };

function ProductCard({ item, onAddToCart }: { item: CatalogItem; onAddToCart: (item: CatalogItem) => void }) {
  const [showAllInstallments, setShowAllInstallments] = React.useState(false);
  const primaryPhoto = item.photos.find(p => p.isPrimary) ?? item.photos[0];
  
  const installment12x = item.installmentOptions.find(opt => opt.installments === 12);

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {primaryPhoto ? (
          <img src={primaryPhoto.url} alt={item.model} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Smartphone className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Model & Storage */}
        <div>
          <h3 className="font-bold text-foreground text-sm">{item.model}</h3>
          <p className="text-xs text-muted-foreground">{item.storage} {item.color && `• ${item.color}`}</p>
        </div>

        {/* Condition & Battery */}
        <div className="flex items-center justify-between gap-2">
          <ConditionBadge condition={item.condition} />
          {item.batteryHealth && <BatteryBadge health={item.batteryHealth} />}
        </div>

        {/* Price */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">À vista</p>
          <p className="font-bold text-lg text-foreground">{formatCurrency(item.cashPrice)}</p>
        </div>

        {/* 12x Highlight */}
        {installment12x && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
            <p className="text-xs text-blue-600 font-medium">12x de</p>
            <p className="font-bold text-blue-700">{formatCurrency(installment12x.perInstallment)}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => setShowAllInstallments(true)}
          >
            Ver parcelas
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={() => {
              onAddToCart(item);
              toast.success(`${item.model} adicionado ao carrinho!`);
            }}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Comprar
          </Button>
        </div>
      </div>
    </motion.div>

    {/* Installments Modal */}
    <Dialog open={showAllInstallments} onOpenChange={setShowAllInstallments}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">{item.model} {item.storage} - Opções de Parcelamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {item.installmentOptions.sort((a, b) => a.installments - b.installments).map((opt, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                opt.installments === 12
                  ? "bg-blue-50 border-blue-300 ring-1 ring-blue-300"
                  : "bg-card border-border"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {opt.installments === 0 ? "Débito" : `${opt.installments}x`}
                </span>
                <span className="text-xs text-muted-foreground">({opt.rate}%)</span>
                {opt.installments === 12 && (
                  <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-medium">Destaque</span>
                )}
              </div>
              <span className={`font-bold ${
                opt.installments === 12 ? "text-blue-700" : "text-primary"
              }`}>
                {formatCurrency(opt.perInstallment)}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

function CartDrawer({ items, onRemove, onCheckout, isOpen, onClose }: { 
  items: CartItem[]; 
  onRemove: (id: number) => void;
  onCheckout: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const total = items.reduce((sum, item) => sum + item.cashPrice * item.quantity, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Carrinho de Compras</DialogTitle>
        </DialogHeader>
        
        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Seu carrinho está vazio</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{item.model} {item.storage}</p>
                    <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                    <p className="font-bold text-primary text-sm mt-1">{formatCurrency(item.cashPrice * item.quantity)}</p>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-border pt-3">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-foreground">Total (à vista):</span>
                <span className="font-bold text-lg text-primary">{formatCurrency(total)}</span>
              </div>

              {/* Checkout Button */}
              <Button 
                size="sm" 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={onCheckout}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Finalizar Compra
              </Button>

            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { data: items, isLoading } = trpc.catalog.list.useQuery();
  const [filterModel, setFilterModel] = useState<string>("all");
  const [filterStorage, setFilterStorage] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const models = useMemo(() => {
    if (!items) return [];
    return Array.from(new Set(items.map(i => i.model).filter(Boolean))).sort() as string[];
  }, [items]);

  const storages = useMemo(() => {
    if (!items) return [];
    return Array.from(new Set(items.map(i => i.storage).filter(Boolean))).sort() as string[];
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter(i => 
      (filterModel === "all" || i.model === filterModel) &&
      (filterStorage === "all" || i.storage === filterStorage) &&
      (filterCategory === "all" || i.category === filterCategory)
    );
  }, [items, filterModel, filterStorage, filterCategory]);

  const handleAddToCart = (item: CatalogItem) => {
    setCartItems(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (id: number) => {
    setCartItems(prev => prev.filter(c => c.id !== id));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    const total = cartItems.reduce((sum, item) => sum + item.cashPrice * item.quantity, 0);

    const itemsList = cartItems.map(item => 
      `${item.model} ${item.storage} (Qtd: ${item.quantity}) - ${formatCurrency(item.cashPrice * item.quantity)}`
    ).join("%0A");

    const message = `Olá! Gostaria de fazer uma compra:%0A%0A${itemsList}%0A%0ATotal: ${formatCurrency(total)}`;
    const whatsappUrl = `https://wa.me/5535998782791?text=${message}`;
    window.open(whatsappUrl, "_blank");
    
    setCartItems([]);
    setShowCart(false);
    toast.success("Redirecionando para WhatsApp...");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663483531727/g2oZZXeaRxGwLSxQQYjLvP/WhatsAppImage2026-03-28at14.00.40_5c1d0c42.jpeg"
                alt="PolliShop"
                className="w-10 h-10 object-contain"
              />
              <div>
                <span className="font-bold text-foreground text-sm">PolliShop</span>
                <span className="font-light text-muted-foreground text-xs block">Eletrônicos</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartItems.length}
                  </span>
                )}
              </button>
              {user?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Painel Admin</span>
                  </Button>
                </Link>
              )}
              {!user && (
                <a href={getLoginUrl()}>
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Entrar</span>
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-background border-b border-border">
        <div className="container relative py-16 md:py-20">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4 max-w-2xl"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                PolliShop Eletrônicos
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Os melhores iPhones seminovos com qualidade garantida e preços competitivos.
              </p>
            </motion.div>
            
            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6 pt-4"
            >
              {[
                { icon: ShieldCheck, label: "Qualidade verificada" },
                { icon: Battery, label: "Bateria informada" },
                { icon: Wrench, label: "Reparos documentados" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="w-4 h-4 text-primary" />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Category Menu */}
      <section className="border-b border-border bg-card/50">
        <div className="container">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            {[
              { icon: Smartphone, label: "Smartphones" },
              { icon: Battery, label: "Tablet" },
              { icon: Wrench, label: "Notebook" },
              { icon: ShieldCheck, label: "Computadores" },
              { icon: Smartphone, label: "Periféricos" },
              { icon: Battery, label: "Acessórios" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                onClick={() => setFilterCategory(label)}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-colors whitespace-nowrap text-sm font-medium ${
                  filterCategory === label
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="pb-20">
        <div className="container">
          {/* Filters */}
          {!isLoading && items && items.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-8 pt-8">
              <Select value={filterModel} onValueChange={setFilterModel}>
                <SelectTrigger className="w-40 bg-card border-border">
                  <SelectValue placeholder="Modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os modelos</SelectItem>
                  {models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStorage} onValueChange={setFilterStorage}>
                <SelectTrigger className="w-40 bg-card border-border">
                  <SelectValue placeholder="Memória" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toda memória</SelectItem>
                  {storages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {(filterModel !== "all" || filterStorage !== "all") && (
                <Button variant="ghost" size="sm" onClick={() => { setFilterModel("all"); setFilterStorage("all"); }}>
                  Limpar filtros
                </Button>
              )}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-8">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty */}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-24">
              <Smartphone className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum produto disponível</h3>
              <p className="text-muted-foreground">
                {items && items.length > 0 ? "Nenhum produto corresponde aos filtros selecionados." : "Em breve novos iPhones disponíveis."}
              </p>
            </div>
          )}

          {/* Grid */}
          {!isLoading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-8">
              {filtered.map(item => (
                <ProductCard key={item.id} item={item} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cart Drawer */}
      <CartDrawer 
        items={cartItems} 
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
        isOpen={showCart}
        onClose={() => setShowCart(false)}
      />
    </div>
  );
}
