import * as React from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, Battery, Wrench, ShieldCheck, LogIn, Settings, ChevronRight, Zap, Percent } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useMemo } from "react";

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
  storage: string;
  color?: string | null;
  batteryHealth: number;
  repairs?: string | null;
  condition: string;
  cashPrice: number;
  installmentOptions: Array<{ installments: number; rate: number; total: number; perInstallment: number }>;
  photos: Array<{ id: number; url: string; isPrimary: boolean }>;
};

function ProductCard({ item }: { item: CatalogItem }) {
  const [showAllInstallments, setShowAllInstallments] = React.useState(false);
  const primaryPhoto = item.photos.find(p => p.isPrimary) ?? item.photos[0];
  
  // Encontrar a opção de 12x (destaque principal)
  const installment12x = item.installmentOptions.find(opt => opt.installments === 12);

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group rounded-lg border border-border bg-card overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-md flex flex-col h-full"
    >
      {/* Photo - Marketplace style */}
      <Link href={`/produto/${item.id}`} className="block">
        <div className="aspect-square bg-muted relative overflow-hidden">
          {primaryPhoto ? (
            <img
              src={primaryPhoto.url}
              alt={`${item.model} ${item.storage}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Smartphone className="w-12 h-12 text-gray-300" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <ConditionBadge condition={item.condition} />
          </div>
        </div>
      </Link>

      {/* Content - Marketplace style */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/produto/${item.id}`} className="block flex-1 mb-3">
          <h3 className="font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {item.model}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.storage} • {item.color || 'Sem cor'}</p>
          <div className="flex items-center gap-2 mt-2">
            <BatteryBadge health={item.batteryHealth} />
            {item.repairs && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Wrench className="w-3 h-3" />
                Reparos
              </span>
            )}
          </div>
        </Link>

        {/* Pricing - Marketplace style */}
        <div className="space-y-3 border-t border-border pt-3">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">À vista</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(item.cashPrice)}</p>
          </div>
          
          {installment12x && (
            <div className="bg-blue-50 border border-blue-200 rounded px-2.5 py-2">
              <p className="text-xs text-blue-600 font-medium mb-0.5">12x</p>
              <p className="text-sm font-bold text-blue-700">
                {formatCurrency(installment12x.perInstallment)}
              </p>
            </div>
          )}
          
          <Button 
            className="w-full gap-2 bg-primary hover:bg-primary/90 text-white" 
            size="sm"
            onClick={() => setShowAllInstallments(true)}
          >
            <Zap className="w-4 h-4" />
            Parcelar
          </Button>
        </div>
        
        {/* Modal com todas as parcelas */}
        <Dialog open={showAllInstallments} onOpenChange={setShowAllInstallments}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-foreground">{item.model} {item.storage} - Parcelamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {item.installmentOptions.sort((a, b) => a.installments - b.installments).map((opt, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    opt.installments === 12
                      ? "bg-blue-50 border-blue-300 ring-1 ring-blue-300"
                      : "bg-card border-border hover:border-primary/30"
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
      </div>
    </motion.div>
    </>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { data: items, isLoading } = trpc.catalog.list.useQuery();
  const [filterModel, setFilterModel] = useState<string>("all");
  const [filterStorage, setFilterStorage] = useState<string>("all");

  const models = useMemo(() => {
    if (!items) return [];
    return Array.from(new Set(items.map(i => i.model))).sort();
  }, [items]);

  const storages = useMemo(() => {
    if (!items) return [];
    return Array.from(new Set(items.map(i => i.storage))).sort();
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter(i => 
      (filterModel === "all" || i.model === filterModel) &&
      (filterStorage === "all" || i.storage === filterStorage)
    );
  }, [items, filterModel, filterStorage]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663483531727/g2oZZXeaRxGwLSxQQYjLvP/pollishop-logo-final_71148b25.png"
                alt="PolliShop"
                className="w-10 h-10 object-contain"
              />
              <div>
                <span className="font-bold text-foreground text-sm">PolliShop</span>
                <span className="font-light text-muted-foreground text-xs block">Eletrônicos</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
        {/* Full Width Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663483531727/g2oZZXeaRxGwLSxQQYjLvP/pollishop-banner-horizontal-EmVCMa2HqgGkuVdYoEMtTS.webp"
            alt="PolliShop Banner"
            className="w-full h-auto object-cover"
          />
        </motion.div>
        
        <div className="container relative py-12 md:py-16">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4 max-w-2xl"
            >
              <p className="text-lg md:text-xl text-muted-foreground">
                Os melhores iPhones seminovos com qualidade garantida e preços competitivos.
              </p>
            </motion.div>
            
            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
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
            <>
              <p className="text-sm text-muted-foreground mb-6 pt-8">
                {filtered.length} {filtered.length === 1 ? "produto disponível" : "produtos disponíveis"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((item, idx) => <ProductCard key={item.id} item={item} />)}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PolliShop Eletrônicos · Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
