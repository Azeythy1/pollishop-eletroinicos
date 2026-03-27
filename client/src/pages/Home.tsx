import { useState, useMemo } from "react";
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-muted shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-muted rounded w-3/4 shimmer" />
        <div className="h-4 bg-muted rounded w-1/2 shimmer" />
        <div className="h-4 bg-muted rounded w-2/3 shimmer" />
        <div className="h-8 bg-muted rounded w-full shimmer mt-4" />
      </div>
    </div>
  );
}

function BatteryBadge({ health }: { health: number }) {
  const color = health >= 85 ? "text-emerald-400" : health >= 70 ? "text-yellow-400" : "text-red-400";
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${color}`}>
      <Battery className="w-3.5 h-3.5" />
      {health}%
    </span>
  );
}

function ConditionBadge({ condition }: { condition: string }) {
  const map: Record<string, { label: string; class: string }> = {
    excelente: { label: "Excelente", class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    bom: { label: "Bom", class: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    regular: { label: "Regular", class: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
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
  
  // Encontrar a melhor opção (maior número de parcelas disponível)
  const bestInstallment = item.installmentOptions.reduce<typeof item.installmentOptions[0] | null>((best, opt) => {
    if (!best || opt.installments > best.installments) return opt;
    return best;
  }, null);

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col"
    >
      {/* Photo */}
      <Link href={`/produto/${item.id}`} className="block">
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {primaryPhoto ? (
            <img
              src={primaryPhoto.url}
              alt={`${item.model} ${item.storage}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Smartphone className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <ConditionBadge condition={item.condition} />
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <Link href={`/produto/${item.id}`} className="block flex-1">
          <h3 className="font-semibold text-foreground text-lg leading-tight group-hover:text-primary transition-colors">
            {item.model}
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="secondary" className="text-xs font-medium">{item.storage}</Badge>
            {item.color && <span className="text-xs text-muted-foreground">{item.color}</span>}
          </div>

          <div className="flex items-center gap-4 mt-3">
            <BatteryBadge health={item.batteryHealth} />
            {item.repairs && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Wrench className="w-3.5 h-3.5" />
                Com reparos
              </span>
            )}
          </div>
        </Link>

        {/* Pricing */}
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">À vista</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(item.cashPrice)}</p>
            </div>
            {installment12x && (
              <div className="text-right bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/40 rounded-lg px-3 py-2">
                <p className="text-xs text-amber-300 font-medium mb-0.5">12x Destaque</p>
                <p className="text-sm font-bold text-amber-400">
                  {formatCurrency(installment12x.perInstallment)}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Link href={`/produto/${item.id}`} className="flex-1">
              <Button className="w-full gap-2" size="sm">
                Ver detalhes <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            {item.installmentOptions.length > 1 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => setShowAllInstallments(true)}
              >
                <Percent className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mais</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Modal com todas as parcelas */}
        <Dialog open={showAllInstallments} onOpenChange={setShowAllInstallments}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{item.model} {item.storage} - Todas as parcelas</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {item.installmentOptions.map((opt, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    opt.installments === 12
                      ? "bg-amber-500/15 border-amber-500/40 ring-1 ring-amber-500/30"
                      : "bg-card border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {opt.installments === 0 ? "Débito" : `${opt.installments}x`}
                    </span>
                    <span className="text-xs text-muted-foreground">({opt.rate}%)</span>
                    {opt.installments === 12 && (
                      <span className="text-xs bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-medium">Destaque</span>
                    )}
                  </div>
                  <span className={`font-bold ${
                    opt.installments === 12 ? "text-amber-400" : "text-primary"
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
    return items.filter(i => {
      if (filterModel !== "all" && i.model !== filterModel) return false;
      if (filterStorage !== "all" && i.storage !== filterStorage) return false;
      return true;
    });
  }, [items, filterModel, filterStorage]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <span className="font-bold text-foreground text-lg">iPhone</span>
                <span className="font-light text-primary ml-1">Seminovos</span>
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

      {/* Hero */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container text-center relative">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
              Catálogo atualizado
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
              iPhones <span className="text-primary">Seminovos</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto">
              Dispositivos selecionados com qualidade garantida. Transparência total sobre condição e histórico.
            </p>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 mt-10"
          >
            {[
              { icon: ShieldCheck, label: "Qualidade verificada" },
              { icon: Battery, label: "Saúde da bateria informada" },
              { icon: Wrench, label: "Reparos documentados" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-primary" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="pb-20">
        <div className="container">
          {/* Filters */}
          {!isLoading && items && items.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-8">
              <Select value={filterModel} onValueChange={setFilterModel}>
                <SelectTrigger className="w-48 bg-card border-border">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <p className="text-sm text-muted-foreground mb-6">
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
      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} iPhone Seminovos · Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
