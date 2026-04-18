"use client";

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
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Upload, X, Star, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

const CATEGORIES = ["Smartphones", "Tablet", "Notebook", "Computadores", "Periféricos", "Acessórios"];
const COLORS = ["Preto", "Branco", "Azul", "Vermelho", "Verde", "Roxo", "Amarelo", "Rosa", "Prata", "Grafite", "Titanium", "Natural", "Outro"];
const CONDITIONS = ["excelente", "bom", "regular"];

// Schema base com passthrough para campos dinâmicos
const baseSchema = z.object({
  category: z.string().min(1, "Selecione a categoria"),
  color: z.string().optional().nullable(),
  condition: z.enum(["excelente", "bom", "regular"]),
  costPrice: z.number().positive("Preço de custo obrigatório"),
  priceAdjustType: z.enum(["percentage", "fixed"]),
  priceAdjustValue: z.number().min(0).default(0),
  status: z.enum(["draft", "published"]),
  notes: z.string().optional().nullable(),
}).passthrough();

// Schemas específicos por categoria
const smartphoneSchema = baseSchema.extend({
  model: z.string().min(1, "Selecione o modelo"),
  storage: z.string().optional().nullable(),
  batteryHealth: z.number().int().min(1).max(100).optional().nullable(),
  repairs: z.string().optional().nullable(),
});

const tabletSchema = baseSchema.extend({
  model: z.string().min(1, "Selecione o modelo"),
  storage: z.string().optional().nullable(),
  batteryHealth: z.number().int().min(1).max(100).optional().nullable(),
  repairs: z.string().optional().nullable(),
});

const notebookSchema = baseSchema.extend({
  model: z.string().min(1, "Nome/Modelo obrigatório"),
  brand: z.string().min(1, "Marca obrigatória"),
  processor: z.string().min(1, "Processador obrigatório"),
  ram: z.string().min(1, "RAM obrigatória"),
  storageCapacity: z.string().min(1, "Armazenamento obrigatório"),
  screen: z.string().min(1, "Tamanho de tela obrigatório"),
  gpu: z.string().optional(),
});

const computerSchema = baseSchema.extend({
  model: z.string().min(1, "Nome/Modelo obrigatório"),
  brand: z.string().min(1, "Marca obrigatória"),
  processor: z.string().min(1, "Processador obrigatório"),
  ram: z.string().min(1, "RAM obrigatória"),
  storageCapacity: z.string().min(1, "Armazenamento obrigatório"),
  gpu: z.string().min(1, "GPU obrigatória"),
  powerSupply: z.string().min(1, "Fonte obrigatória"),
  cooler: z.string().optional().nullable(),
  cabinet: z.string().optional().nullable(),
});

const peripheralSchema = baseSchema.extend({
  model: z.string().min(1, "Nome do produto obrigatório"),
  brand: z.string().min(1, "Marca obrigatória"),
  itemType: z.string().min(1, "Tipo obrigatório"),
  itemCategory: z.enum(["Informática", "Acessórios"]).optional().nullable(),
  itemSubcategory: z.string().optional().nullable(),
  specifications: z.string().optional(),
});

const accessorySchema = baseSchema.extend({
  model: z.string().min(1, "Nome do produto obrigatório"),
  itemType: z.string().min(1, "Tipo obrigatório"),
  compatibility: z.string().min(1, "Compatibilidade obrigatória"),
  specifications: z.string().optional(),
});

type FormData = Record<string, any>;

type SubmitHandler = (data: any) => Promise<void>;

function getSchemaForCategory(category: string) {
  switch (category) {
    case "Smartphones":
      return smartphoneSchema;
    case "Tablet":
      return tabletSchema;
    case "Notebook":
      return notebookSchema;
    case "Computadores":
      return computerSchema;
    case "Periféricos":
      return peripheralSchema;
    case "Acessórios":
      return accessorySchema;
    default:
      return smartphoneSchema;
  }
}

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

  const [selectedCategory, setSelectedCategory] = useState<string>("Smartphones");
  const [selectedRates, setSelectedRates] = useState<Array<{ installments: number; rateId: number }>>([]);
  const [photos, setPhotos] = useState<Array<{ id?: number; url: string; isPrimary: boolean; file?: File; uploading?: boolean }>>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const form = useForm<FormData>({
    mode: "onBlur",
    defaultValues: {
      category: "Smartphones",
      condition: "bom",
      priceAdjustType: "percentage",
      status: "draft",
    },
  });

  // Atualizar schema quando categoria muda
  useEffect(() => {
    form.clearErrors();
    // Revalidar com novo schema
    const schema = getSchemaForCategory(selectedCategory);
    form.trigger();
  }, [selectedCategory, form]);

  // Carregar dados do produto existente
  useEffect(() => {
    if (existingProduct) {
      setSelectedCategory(existingProduct.category as string);
      form.reset({
        category: existingProduct.category as string,
        model: existingProduct.model || "",
        storage: existingProduct.storage || "",
        batteryHealth: existingProduct.batteryHealth || 85,
        repairs: existingProduct.repairs || "",
        color: existingProduct.color || "",
        condition: (existingProduct.condition as any) || "bom",
        costPrice: existingProduct.costPrice as number,
        priceAdjustType: (existingProduct.priceAdjustType as any) || "percentage",
        priceAdjustValue: existingProduct.priceAdjustValue as number,
        status: (existingProduct.status as any) || "draft",
        notes: existingProduct.notes || "",
        brand: existingProduct.brand || "",
        processor: existingProduct.processor || "",
        ram: existingProduct.ram || "",
        storageCapacity: existingProduct.storageCapacity || "",
        gpu: existingProduct.gpu || "",
        powerSupply: existingProduct.powerSupply || "",
        screen: existingProduct.screen || "",
        itemType: existingProduct.itemType || "",
        itemCategory: (existingProduct.itemCategory as any) || null,
        itemSubcategory: existingProduct.itemSubcategory || "",
        specifications: existingProduct.specifications || "",
        compatibility: existingProduct.compatibility || "",
        cooler: existingProduct.cooler || "",
        cabinet: existingProduct.cabinet || "",
      });
      if (existingProduct.photos) {
        setPhotos(existingProduct.photos.map((p: any) => ({ id: p.id, url: p.url, isPrimary: p.isPrimary })));
      }
    }
  }, [existingProduct, form]);

  const createMutation = trpc.admin.createIphone.useMutation({
    onSuccess: async (newProduct) => {
      if (newProduct && photos.some(p => p.file)) {
        await uploadPendingPhotos(newProduct.id as unknown as number);
      }
      toast.success("Produto criado com sucesso!");
      utils.admin.listIphones.invalidate();
      navigate("/admin/produtos");
    },
    onError: (e: any) => {
      console.error('[AdminProductForm] Create error:', e);
      const errorMsg = e.data?.zodError ? Object.values(e.data.zodError).flat().join(', ') : (e.message || 'Erro desconhecido');
      toast.error(`Erro ao criar: ${errorMsg}`);
    },
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
    onError: (e: any) => {
      console.error('[AdminProductForm] Update error:', e);
      const errorMsg = e.data?.zodError ? Object.values(e.data.zodError).flat().join(', ') : (e.message || 'Erro desconhecido');
      toast.error(`Erro ao atualizar: ${errorMsg}`);
    },
  });

  const uploadPendingPhotos = async (iPhoneId: number) => {
    const filesToUpload = photos.filter(p => p.file);
    if (!filesToUpload.length) return;

    setUploadingPhotos(true);
    try {
      for (const photo of filesToUpload) {
        if (photo.file) {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              const base64String = result.split(',')[1];
              resolve(base64String);
            };
            reader.onerror = reject;
            if (photo.file) reader.readAsDataURL(photo.file);
          });

          const response = await fetch('/api/trpc/admin.uploadPhoto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              json: {
                iphoneId: iPhoneId,
                filename: photo.file.name,
                mimeType: photo.file.type,
                base64,
                isPrimary: photo.isPrimary,
              },
            }),
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(`Upload failed: ${error}`);
          }
        }
      }
      setPhotos(photos.filter(p => !p.file));
      toast.success('Fotos enviadas com sucesso!');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Erro ao fazer upload de fotos');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos([...photos, { url: event.target?.result as string, isPrimary: photos.length === 0, file }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSetPrimary = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setPhotos(photos.map((p, i) => ({ ...p, isPrimary: i === index })));
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    form.setValue("category", value);
  };

  const onSubmit = async (data: any) => {
    console.log('[AdminProductForm] Submitting:', data);
    
    // Converter campos vazios em null, mas preservar campos obrigatórios
    const requiredFields = ['model', 'category', 'costPrice', 'condition', 'priceAdjustType', 'status'];
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if ((value === '' || value === undefined) && !requiredFields.includes(key)) {
        acc[key] = null;
      } else if (value === '' && requiredFields.includes(key)) {
        acc[key] = undefined; // Deixar undefined para validação falhar
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    // Garantir que priceAdjustValue seja um número válido
    if (isNaN(cleanData.priceAdjustValue)) {
      cleanData.priceAdjustValue = 0;
    }
    
    // Validar com schema apropriado
    const schema = getSchemaForCategory(selectedCategory);
    try {
      await schema.parseAsync(cleanData);
    } catch (err: any) {
      console.error('Validation error:', err);
      toast.error('Erro de validação: ' + err.message);
      return;
    }
    
    const installmentConfig = selectedRates.map(r => ({
      installments: r.installments,
      rateId: r.rateId,
    }));

    if (isEditing && productId) {
      updateMutation.mutate({
        id: productId,
        data: {
          ...cleanData,
          installmentConfig,
        },
      });
    } else {
      createMutation.mutate({
        ...cleanData,
        installmentConfig,
      });
    }
  };

  if (loadingProduct) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin" /></div>;
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const costPrice = Number(form.watch("costPrice")) || 0;
  const adjustType = form.watch("priceAdjustType") || "percentage";
  const adjustValue = Number(form.watch("priceAdjustValue")) || 0;
  const cashPrice = adjustType === "percentage" ? costPrice * (1 + adjustValue / 100) : costPrice + adjustValue;

  const getErrorMessage = (error: any): string => {
    if (!error) return "";
    if (typeof error.message === "string") return error.message;
    return String(error.message || "");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/produtos">
          <Button variant="ghost" size="sm" className="mb-6">
            <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-8">{isEditing ? "Editar Produto" : "Novo Produto"}</h1>

          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
            {/* Categoria */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Categoria *</Label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campos dinâmicos por categoria */}
            {(selectedCategory === "Smartphones" || selectedCategory === "Tablet") && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Modelo *</Label>
                    <Input 
                      value={form.watch("model") || ""}
                      onChange={(e) => form.setValue("model", e.target.value)}
                      placeholder="iPhone 15 Pro" 
                    />
                    {form.formState.errors.model && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.model)}</p>}
                  </div>
                  <div>
                    <Label>Memória *</Label>
                    <Select value={form.watch("storage") || ""} onValueChange={(v) => form.setValue("storage", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["64GB", "128GB", "256GB", "512GB", "1TB"].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.storage && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.storage)}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Saúde da Bateria (%) *</Label>
                    <Slider value={[form.watch("batteryHealth") || 85]} onValueChange={(v) => form.setValue("batteryHealth", v[0])} min={1} max={100} step={1} />
                    <p className="text-sm text-gray-600 mt-2">{form.watch("batteryHealth")}%</p>
                  </div>
                  <div>
                    <Label>Cor</Label>
                    <Select value={form.watch("color") || ""} onValueChange={(v) => form.setValue("color", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLORS.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Reparos Realizados</Label>
                  <Textarea {...form.register("repairs")} placeholder="Ex: Trocado vidro traseiro, bateria nova..." />
                </div>
              </>
            )}

            {selectedCategory === "Notebook" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Modelo/Nome *</Label>
                    <Input {...form.register("model")} placeholder="Notebook XYZ" />
                    {form.formState.errors.model && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.model)}</p>}
                  </div>
                  <div>
                    <Label>Marca *</Label>
                    <Input {...form.register("brand")} placeholder="Dell, Lenovo, HP..." />
                    {form.formState.errors.brand && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.brand)}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Processador *</Label>
                    <Input {...form.register("processor")} placeholder="Intel i5 12th Gen" />
                    {form.formState.errors.processor && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.processor)}</p>}
                  </div>
                  <div>
                    <Label>RAM *</Label>
                    <Input {...form.register("ram")} placeholder="16GB DDR4" />
                    {form.formState.errors.ram && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.ram)}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Armazenamento *</Label>
                    <Input {...form.register("storageCapacity")} placeholder="SSD 512GB" />
                    {form.formState.errors.storageCapacity && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.storageCapacity)}</p>}
                  </div>
                  <div>
                    <Label>Tela *</Label>
                    <Input {...form.register("screen")} placeholder="15.6 polegadas" />
                    {form.formState.errors.screen && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.screen)}</p>}
                  </div>
                </div>

                <div>
                  <Label>GPU</Label>
                  <Input {...form.register("gpu")} placeholder="NVIDIA GTX 1650" />
                </div>
              </>
            )}

            {selectedCategory === "Computadores" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Modelo/Nome *</Label>
                    <Input {...form.register("model")} placeholder="PC Gamer XYZ" />
                    {form.formState.errors.model && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.model)}</p>}
                  </div>
                  <div>
                    <Label>Marca *</Label>
                    <Input {...form.register("brand")} placeholder="Marca do gabinete" />
                    {form.formState.errors.brand && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.brand)}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Processador *</Label>
                    <Input {...form.register("processor")} placeholder="Intel i7 13th Gen" />
                    {form.formState.errors.processor && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.processor)}</p>}
                  </div>
                  <div>
                    <Label>RAM *</Label>
                    <Input {...form.register("ram")} placeholder="32GB DDR5" />
                    {form.formState.errors.ram && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.ram)}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Armazenamento *</Label>
                    <Input {...form.register("storageCapacity")} placeholder="SSD 1TB + HDD 2TB" />
                    {form.formState.errors.storageCapacity && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.storageCapacity)}</p>}
                  </div>
                  <div>
                    <Label>GPU *</Label>
                    <Input {...form.register("gpu")} placeholder="NVIDIA RTX 4070" />
                    {form.formState.errors.gpu && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.gpu)}</p>}
                  </div>
                </div>

                <div>
                  <Label>Fonte *</Label>
                  <Input {...form.register("powerSupply")} placeholder="850W 80+ Gold" />
                  {form.formState.errors.powerSupply && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.powerSupply)}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cooler</Label>
                    <Input {...form.register("cooler")} placeholder="Water Cooler 360mm" />
                  </div>
                  <div>
                    <Label>Gabinete</Label>
                    <Input {...form.register("cabinet")} placeholder="Lian Li O11 Dynamic" />
                  </div>
                </div>
              </>
            )}

            {selectedCategory === "Periféricos" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Produto *</Label>
                    <Input {...form.register("model")} placeholder="Mouse Gamer RGB" />
                    {form.formState.errors.model && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.model)}</p>}
                  </div>
                  <div>
                    <Label>Marca *</Label>
                    <Input {...form.register("brand")} placeholder="Logitech, Razer..." />
                    {form.formState.errors.brand && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.brand)}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo *</Label>
                    <Input {...form.register("itemType")} placeholder="Mouse, Teclado, Monitor, Headset..." />
                    {form.formState.errors.itemType && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.itemType)}</p>}
                  </div>
                  <div>
                    <Label>Categoria de Item</Label>
                    <Select value={form.watch("itemCategory") || ""} onValueChange={(v) => form.setValue("itemCategory", v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Informática">Informática</SelectItem>
                        <SelectItem value="Acessórios">Acessórios</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Subcategoria</Label>
                  <Input {...form.register("itemSubcategory")} placeholder="Mouse Gamer, Teclado Mecânico..." />
                </div>

                <div>
                  <Label>Especificações</Label>
                  <Textarea {...form.register("specifications")} placeholder="DPI, conexão, resolução, etc..." />
                </div>
              </>
            )}

            {selectedCategory === "Acessórios" && (
              <>
                <div>
                  <Label>Nome do Produto *</Label>
                  <Input {...form.register("model")} placeholder="Capa de iPhone 15" />
                  {form.formState.errors.model && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.model)}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo *</Label>
                    <Input {...form.register("itemType")} placeholder="Capa, Película, Carregador..." />
                    {form.formState.errors.itemType && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.itemType)}</p>}
                  </div>
                  <div>
                    <Label>Compatibilidade *</Label>
                    <Input {...form.register("compatibility")} placeholder="iPhone 13-15" />
                    {form.formState.errors.compatibility && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.compatibility)}</p>}
                  </div>
                </div>

                <div>
                  <Label>Especificações</Label>
                  <Textarea {...form.register("specifications")} placeholder="Material, cor, características..." />
                </div>
              </>
            )}

            {/* Campos comuns */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Preços e Condição</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Condição *</Label>
                  <Select value={form.watch("condition")} onValueChange={(v) => form.setValue("condition", v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cor</Label>
                  <Select value={form.watch("color") || ""} onValueChange={(v) => form.setValue("color", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLORS.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Preço de Custo (R$) *</Label>
                  <Input type="number" step="0.01" {...form.register("costPrice", { valueAsNumber: true })} />
                  {form.formState.errors.costPrice && <p className="text-red-500 text-sm mt-1">{getErrorMessage(form.formState.errors.costPrice)}</p>}
                </div>
                <div>
                  <Label>Ajuste de Preço</Label>
                  <div className="flex gap-2">
                    <Select value={adjustType} onValueChange={(v) => form.setValue("priceAdjustType", v as any)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="fixed">R$</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="number" step="0.01" {...form.register("priceAdjustValue", { valueAsNumber: true })} placeholder="0" className="flex-1" />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Preço à Vista:</span> {formatCurrency(cashPrice)}
                </p>
              </div>
            </div>

            {/* Fotos */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Fotos do Produto</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-input" />
                <label htmlFor="photo-input" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Clique para selecionar fotos</p>
                </label>
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative group">
                      <img src={photo.url} alt={`Photo ${idx}`} className="w-full h-24 object-cover rounded-lg" />
                      {photo.isPrimary && <Star className="absolute top-1 right-1 w-4 h-4 fill-yellow-400 text-yellow-400" />}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={(e) => handleSetPrimary(idx, e)} className="bg-white p-1 rounded"><Star className="w-4 h-4" /></button>
                        <button onClick={(e) => handleRemovePhoto(idx, e)} className="bg-white p-1 rounded"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Parcelamentos */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Opções de Parcelamento</h3>
              <div className="grid grid-cols-3 gap-2">
                {rates?.map(rate => (
                  <label key={rate.id} className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <Checkbox
                      checked={selectedRates.some(r => r.rateId === rate.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRates([...selectedRates, { installments: rate.installments, rateId: rate.id }]);
                        } else {
                          setSelectedRates(selectedRates.filter(r => r.rateId !== rate.id));
                        }
                      }}
                    />
                    <span className="text-sm">{rate.installments}x ({rate.rate}%)</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status e Notas */}
            <div className="border-t pt-6 grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notas Internas</Label>
                <Input {...form.register("notes")} placeholder="Anotações sobre o produto..." />
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6 border-t">
              <Button type="submit" disabled={isSaving || uploadingPhotos} className="flex-1">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isEditing ? "Atualizar" : "Criar"} Produto
              </Button>
              <Link href="/admin/produtos">
                <Button type="button" variant="outline" className="flex-1">Cancelar</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
