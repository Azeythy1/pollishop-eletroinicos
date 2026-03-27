import { useState, useEffect, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Upload, X, Star, Loader2, DollarSign, Percent, Calculator } from "lucide-react";
import { Link } from "wouter";

const IPHONE_MODELS = [
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
  "iPhone 12", "iPhone 12 Mini", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13", "iPhone 13 Mini", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
  "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max",
  "iPhone 17", "iPhone 17 Plus", "iPhone 17 Pro", "iPhone 17 Pro Max",
];

const STORAGE_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const COLORS = ["Preto", "Branco", "Azul", "Vermelho", "Verde", "Roxo", "Amarelo", "Rosa", "Prata", "Grafite", "Titanium", "Natural", "Outro"];

const schema = z.object({
  model: z.string().min(1, "Selecione o modelo"),
  storage: z.string().min(1, "Selecione a memória"),
  color: z.string().optional(),
  batteryHealth: z.number().int().min(1).max(100),
  repairs: z.string().optional(),
  condition: z.enum(["excelente", "bom", "regular"]),
  costPrice: z.number().positive("Preço de custo obrigatório"),
  priceAdjustType: z.enum(["percentage", "fixed"]),
  priceAdjustValue: z.number().min(0),
  status: z.enum(["draft", "published"]),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function AdminProductForm() {
  const [, params] = useRoute("/admin/produtos/:id/editar");
  const [, navigate] = useLocation();
  const isEditing = !!params?.id;
  const productId = isEditing ? parseInt(params.id) : null;

  const utils = trpc.useUtils();
  const { data: existingProduct, isLoading: loadingProduct } = trpc.admin.getIphone.useQuery(
    { id: productId! },
    { enabled: !!productId }
  );
  const { data: rates } = trpc.admin.getRatesPublic.useQuery();

  const [selectedRates, setSelectedRates] = useState<Array<{ installments: number; rateId: number }>>([]);
  const [photos, setPhotos] = useState<Array<{ id?: number; url: string; isPrimary: boolean; file?: File; uploading?: boolean }>>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const createMutation = trpc.admin.createIphone.useMutation({
    onSuccess: async (newProduct) => {
      if (newProduct && photos.some(p => p.file)) {
        await uploadPendingPhotos(newProduct.id as unknown as number);
      }
      toast.success("Produto criado com sucesso!");
      utils.admin.listIphones.invalidate();
      navigate("/admin/produtos");
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const updateMutation = trpc.admin.updateIphone.useMutation({
    onSuccess: async () => {
      if (productId && photos.some(p => p.file)) {
        await uploadPendingPhotos(productId);
      }
      toast.success("Produto atualizado com sucesso!");
      utils.admin.listIphones.invalidate();
      navigate("/admin/produtos");
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const uploadPhotoMutation = trpc.admin.uploadPhoto.useMutation();
  const deletePhotoMutation = trpc.admin.deletePhoto.useMutation();
  const setPrimaryMutation = trpc.admin.setPrimaryPhoto.useMutation();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      condition: "bom",
      priceAdjustType: "percentage",
      priceAdjustValue: 0,
      batteryHealth: 85,
      status: "draft",
    },
    mode: 'onBlur',
  });

  const costPrice = watch("costPrice") || 0;
  const adjustType = watch("priceAdjustType");
  const adjustValue = watch("priceAdjustValue") || 0;
  const batteryHealth = watch("batteryHealth") || 85;

  const cashPrice = adjustType === "percentage"
    ? costPrice * (1 + adjustValue / 100)
    : costPrice + adjustValue;

  // Load existing product data
  useEffect(() => {
    if (existingProduct) {
      setValue("model", existingProduct.model);
      setValue("storage", existingProduct.storage);
      setValue("color", existingProduct.color ?? "");
      setValue("batteryHealth", existingProduct.batteryHealth);
      setValue("repairs", existingProduct.repairs ?? "");
      setValue("condition", existingProduct.condition);
      setValue("costPrice", existingProduct.costPrice);
      setValue("priceAdjustType", existingProduct.priceAdjustType);
      setValue("priceAdjustValue", existingProduct.priceAdjustValue);
      setValue("status", existingProduct.status);
      setValue("notes", existingProduct.notes ?? "");
      const config = existingProduct.installmentConfig as Array<{ installments: number; rateId: number }> | null;
      if (config) setSelectedRates(config);
      setPhotos(existingProduct.photos.map(p => ({ id: p.id, url: p.url, isPrimary: p.isPrimary })));
    }
  }, [existingProduct, setValue]);

  const uploadPendingPhotos = useCallback(async (iphoneId: number) => {
    const pending = photos.filter(p => p.file);
    if (pending.length === 0) return;
    setUploadingPhotos(true);
    for (const photo of pending) {
      if (!photo.file) continue;
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onload = async (e) => {
          const base64 = (e.target?.result as string).split(",")[1];
          await uploadPhotoMutation.mutateAsync({
            iphoneId,
            filename: photo.file!.name,
            mimeType: photo.file!.type,
            base64,
            isPrimary: photo.isPrimary,
          });
          resolve();
        };
        reader.readAsDataURL(photo.file!);
      });
    }
    setUploadingPhotos(false);
  }, [photos, uploadPhotoMutation]);

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newPhotos = files.map((file, i) => ({
      url: URL.createObjectURL(file),
      isPrimary: photos.length === 0 && i === 0,
      file,
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
    e.target.value = "";
  };

  const handlePhotoRemove = async (idx: number) => {
    const photo = photos[idx];
    if (photo.id && productId) {
      await deletePhotoMutation.mutateAsync({ photoId: photo.id });
      utils.admin.getIphone.invalidate({ id: productId });
    }
    setPhotos(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (photo.isPrimary && next.length > 0) next[0].isPrimary = true;
      return next;
    });
  };

  const handleSetPrimary = async (idx: number) => {
    const photo = photos[idx];
    if (photo.id && productId) {
      await setPrimaryMutation.mutateAsync({ iphoneId: productId, photoId: photo.id });
    }
    setPhotos(prev => prev.map((p, i) => ({ ...p, isPrimary: i === idx })));
  };

  const onSubmit = (data: FormData) => {
    console.log('[AdminProductForm] Form submitted with data:', data);
    const payload = {
      ...data,
      installmentConfig: selectedRates,
    };
    console.log('[AdminProductForm] Payload to send:', payload);
    if (isEditing && productId) {
      console.log('[AdminProductForm] Updating product:', productId);
      updateMutation.mutate({ id: productId, data: payload });
    } else {
      console.log('[AdminProductForm] Creating new product');
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || uploadingPhotos;

  if (isEditing && loadingProduct) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/produtos">
          <Button variant="ghost" size="icon" className="w-9 h-9">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? "Editar Produto" : "Novo Produto"}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isEditing ? "Atualize as informações do iPhone" : "Cadastre um novo iPhone seminovo"}
          </p>
        </div>
      </div>

      <form onSubmit={(e) => {
        console.log('[AdminProductForm] Form onSubmit triggered');
        handleSubmit(onSubmit)(e);
      }} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h2 className="font-semibold text-foreground">Informações do Produto</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Modelo *</Label>
              <Select onValueChange={v => setValue("model", v)} value={watch("model")}>
                <SelectTrigger className={errors.model ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {IPHONE_MODELS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.model && <p className="text-xs text-destructive">{errors.model.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Memória *</Label>
              <Select onValueChange={v => setValue("storage", v)} value={watch("storage")}>
                <SelectTrigger className={errors.storage ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione a memória" />
                </SelectTrigger>
                <SelectContent>
                  {STORAGE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.storage && <p className="text-xs text-destructive">{errors.storage.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <Select onValueChange={v => setValue("color", v)} value={watch("color")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cor" />
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Condição *</Label>
              <Select onValueChange={v => setValue("condition", v as "excelente" | "bom" | "regular")} value={watch("condition")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excelente">Excelente</SelectItem>
                  <SelectItem value="bom">Bom</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Battery Health */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Saúde da Bateria *</Label>
              <span className={`text-sm font-bold ${batteryHealth >= 85 ? "text-emerald-400" : batteryHealth >= 70 ? "text-yellow-400" : "text-red-400"}`}>
                {batteryHealth}%
              </span>
            </div>
            <Slider
              min={1}
              max={100}
              step={1}
              value={[batteryHealth]}
              onValueChange={([v]) => setValue("batteryHealth", v)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1%</span><span>50%</span><span>100%</span>
            </div>
          </div>

          {/* Repairs */}
          <div className="space-y-2">
            <Label>Reparos Realizados</Label>
            <Textarea
              placeholder="Descreva os reparos realizados (ex: troca de tela, bateria nova...)"
              className="resize-none"
              rows={3}
              {...register("repairs")}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notas Internas</Label>
            <Textarea
              placeholder="Observações internas (não visíveis ao público)"
              className="resize-none"
              rows={2}
              {...register("notes")}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Precificação
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preço de Custo (R$) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className={`pl-9 ${errors.costPrice ? "border-destructive" : ""}`}
                  {...register("costPrice", { valueAsNumber: true })}
                />
              </div>
              {errors.costPrice && <p className="text-xs text-destructive">{errors.costPrice.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Tipo de Ajuste</Label>
              <Select onValueChange={v => setValue("priceAdjustType", v as "percentage" | "fixed")} value={adjustType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                  <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{adjustType === "percentage" ? "Margem (%)" : "Acréscimo (R$)"}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {adjustType === "percentage" ? <Percent className="w-3.5 h-3.5" /> : <span className="text-sm">R$</span>}
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  className="pl-9"
                  {...register("priceAdjustValue", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calculator className="w-3.5 h-3.5 text-primary" />
                Preço à Vista (calculado)
              </Label>
              <div className="h-10 px-3 rounded-lg border border-primary/30 bg-primary/5 flex items-center">
                <span className="font-bold text-primary">{formatCurrency(isNaN(cashPrice) ? 0 : cashPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Installment Rates */}
        {rates && rates.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Percent className="w-4 h-4 text-primary" />
              Opções de Parcelamento
            </h2>
            <p className="text-xs text-muted-foreground">Selecione quais opções de parcelamento serão exibidas para este produto.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {rates.map(rate => {
                const isSelected = selectedRates.some(r => r.rateId === rate.id);
                const installmentPrice = isNaN(cashPrice) ? 0 : cashPrice * (1 + rate.rate / 100) / rate.installments;
                return (
                  <label
                    key={rate.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={checked => {
                        if (checked) {
                          setSelectedRates(prev => [...prev, { installments: rate.installments, rateId: rate.id }]);
                        } else {
                          setSelectedRates(prev => prev.filter(r => r.rateId !== rate.id));
                        }
                      }}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{rate.installments}x</p>
                      <p className="text-xs text-muted-foreground">{rate.rate}% a.m.</p>
                      {!isNaN(cashPrice) && cashPrice > 0 && (
                        <p className="text-xs text-primary font-medium mt-0.5">{formatCurrency(installmentPrice)}/parcela</p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Photos */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Fotos do Produto</h2>
          <p className="text-xs text-muted-foreground">Adicione até 10 fotos. A primeira marcada como principal aparecerá no catálogo.</p>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); handleSetPrimary(idx); }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${photo.isPrimary ? "bg-primary text-primary-foreground" : "bg-white/20 text-white hover:bg-primary hover:text-primary-foreground"}`}
                    title="Definir como principal"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); handlePhotoRemove(idx); }}
                    className="w-7 h-7 rounded-full bg-destructive/80 text-white flex items-center justify-center hover:bg-destructive"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {photo.isPrimary && (
                  <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-medium">
                    Principal
                  </div>
                )}
              </div>
            ))}

            {photos.length < 10 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Adicionar</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoAdd}
                />
              </label>
            )}
          </div>
        </div>

        {/* Status + Submit */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-medium text-foreground">Publicar no catálogo</p>
              <p className="text-xs text-muted-foreground mt-0.5">Produtos publicados ficam visíveis para todos</p>
            </div>
            <Switch
              checked={watch("status") === "published"}
              onCheckedChange={v => setValue("status", v ? "published" : "draft")}
            />
          </div>

          <div className="flex gap-3">
            <Link href="/admin/produtos" className="flex-1">
              <Button type="button" variant="outline" className="w-full">Cancelar</Button>
            </Link>
            <Button 
              type="submit" 
              className="flex-1 gap-2" 
              disabled={isPending}
              onClick={(e) => {
                console.log('[AdminProductForm] Save button clicked, errors:', errors);
                if (Object.keys(errors).length > 0) {
                  toast.error('Verifique os erros no formulário');
                }
              }}
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar produto"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
