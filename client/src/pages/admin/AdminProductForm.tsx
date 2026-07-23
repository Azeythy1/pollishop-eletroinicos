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
import { ChevronLeft, Upload, X, Star, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

const CATEGORIES = ["Eletrônicos", "Vestiário", "Fitness", "Moda Íntima", "Variados"];

// Schema simplificado
const productSchema = z.object({
  category: z.enum(["Eletrônicos", "Vestiário", "Fitness", "Moda Íntima", "Variados"]),
  model: z.string().min(1, "Nome do produto obrigatório"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  costPrice: z.number().positive("Preço de custo obrigatório"),
  priceAdjustType: z.enum(["percentage", "fixed"]).optional(),
  priceAdjustValue: z.number().min(0).optional(),
  status: z.enum(["draft", "published"]).optional(),
}).strict();

type FormData = z.infer<typeof productSchema>;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function AdminProductForm() {
  const [, params] = useRoute("/admin/produtos/:id/editar");
  const [, navigate] = useLocation();
  const productId = params?.id ? parseInt(params.id) : null;
  const isEditing = !!productId;

  const { data: existingProduct, isLoading: loadingProduct } = trpc.admin.getIphone.useQuery(
    { id: productId! },
    { enabled: !!productId }
  );

  const uploadMutation = trpc.upload.photo.useMutation();

  const [photos, setPhotos] = useState<Array<{ id?: number; url: string; isPrimary: boolean; file?: File; uploading?: boolean }>>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const form = useForm<any>({
    mode: "onBlur",
    resolver: zodResolver(productSchema),
    defaultValues: {
      category: "Eletrônicos",
      priceAdjustType: "percentage",
      priceAdjustValue: 0,
      status: "published", // Status padrão: publicado
    },
  });

  // Carregar dados do produto existente
  useEffect(() => {
    if (existingProduct) {
      form.reset({
        category: existingProduct.category as any,
        model: existingProduct.model,
        description: existingProduct.description,
        costPrice: existingProduct.costPrice,
        priceAdjustType: existingProduct.priceAdjustType as any,
        priceAdjustValue: existingProduct.priceAdjustValue,
        status: existingProduct.status as any,
      });
      setPhotos(existingProduct.photos.map(p => ({ ...p, isPrimary: p.isPrimary })));
    }
  }, [existingProduct, form]);

  const createMutation = trpc.admin.createIphone.useMutation({
    onSuccess: () => {
      toast.success("Produto criado com sucesso!");
      navigate("/admin/produtos");
    },
    onError: (error) => toast.error(`Erro: ${error.message}`),
  });

  const updateMutation = trpc.admin.updateIphone.useMutation({
    onSuccess: () => {
      toast.success("Produto atualizado com sucesso!");
      navigate("/admin/produtos");
    },
    onError: (error) => toast.error(`Erro: ${error.message}`),
  });

  const onSubmit = async (data: FormData) => {
    console.log('[AdminProductForm] Submitting:', data);
    
    if (!photos.length) {
      toast.error("Adicione pelo menos uma foto");
      return;
    }

    const submitData: any = {
      ...data,
      costPrice: data.costPrice,
      priceAdjustValue: data.priceAdjustValue,
    };

    if (isEditing && productId) {
      updateMutation.mutate({ id: productId, ...submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isLoading = loadingProduct || createMutation.isPending || updateMutation.isPending;
  const cashPrice = form.watch("costPrice") * (1 + (form.watch("priceAdjustType") === "percentage" ? form.watch("priceAdjustValue") / 100 : form.watch("priceAdjustValue") / form.watch("costPrice")));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/produtos">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? "Editar Produto" : "Novo Produto"}
          </h1>
        </div>

        {isLoading && !form.getValues("model") ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <form onSubmit={form.handleSubmit((data: any) => onSubmit(data))} className="space-y-8">
            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value as any)}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && typeof form.formState.errors.category === 'object' && 'message' in form.formState.errors.category && (
                <p className="text-sm text-destructive">{(form.formState.errors.category as any).message}</p>
              )}
            </div>

            {/* Nome do Produto */}
            <div className="space-y-2">
              <Label htmlFor="model">Nome do Produto</Label>
              <Input
                id="model"
                placeholder="Ex: iPhone 15 Pro Max, Camiseta Premium, Relógio Inteligente"
                {...form.register("model")}
              />
              {form.formState.errors.model && typeof form.formState.errors.model === 'object' && 'message' in form.formState.errors.model && (
                <p className="text-sm text-destructive">{(form.formState.errors.model as any).message}</p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição Detalhada</Label>
              <Textarea
                id="description"
                placeholder="Descreva todos os detalhes do produto: especificações técnicas, condição, características, histórico, etc."
                rows={8}
                {...form.register("description")}
              />
              {form.formState.errors.description && typeof form.formState.errors.description === 'object' && 'message' in form.formState.errors.description && (
                <p className="text-sm text-destructive">{(form.formState.errors.description as any).message}</p>
              )}
            </div>

            {/* Fotos */}
            <div className="space-y-4">
              <Label>Fotos do Produto (máximo 5)</Label>
              
              {/* Upload área */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById("photo-input")?.click()}
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Clique para adicionar fotos (máximo 5)</p>
                <input
                  id="photo-input"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    if (!e.target.files) return;
                    const files = Array.from(e.target.files);
                    
                    if (photos.length + files.length > 5) {
                      toast.error("Máximo de 5 fotos permitidas");
                      return;
                    }

                    setUploadingPhotos(true);
                    try {
                      for (const file of files) {
                        const result = await uploadMutation.mutateAsync({ file } as any);
                        setPhotos(prev => [...prev, {
                          url: result.url,
                          isPrimary: prev.length === 0,
                          file,
                        }]);
                      }
                      toast.success("Fotos adicionadas com sucesso");
                    } catch (error) {
                      console.error('Upload error:', error);
                      toast.error("Erro ao fazer upload das fotos");
                    } finally {
                      setUploadingPhotos(false);
                    }
                  }}
                />
              </div>

              {/* Fotos existentes */}
              {photos.length > 0 && (
                <div className="grid grid-cols-5 gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img src={photo.url} alt={`Foto ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      
                      {/* Badge primária */}
                      {photo.isPrimary && (
                        <div className="absolute top-1 left-1 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Principal
                        </div>
                      )}
                      
                      {/* Botões de ação */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        {!photo.isPrimary && (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setPhotos(photos.map((p, i) => ({ ...p, isPrimary: i === index })))}
                          >
                            <Star className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preço de Custo */}
            <div className="space-y-2">
              <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register("costPrice", { valueAsNumber: true })}
              />
              {form.formState.errors.costPrice && typeof form.formState.errors.costPrice === 'object' && 'message' in form.formState.errors.costPrice && (
                <p className="text-sm text-destructive">{(form.formState.errors.costPrice as any).message}</p>
              )}
            </div>

            {/* Ajuste de Preço */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceAdjustType">Tipo de Ajuste</Label>
                <Select value={form.watch("priceAdjustType")} onValueChange={(value) => form.setValue("priceAdjustType", value as any)}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentual (%)</SelectItem>
                    <SelectItem value="fixed">Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceAdjustValue">Valor do Ajuste</Label>
                <Input
                  id="priceAdjustValue"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("priceAdjustValue", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Preço Final */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground">Preço à Vista (Calculado)</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(cashPrice)}</p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as any)}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-8">
              <Link href="/admin/produtos">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button 
                type="submit" 
                disabled={isLoading || uploadingPhotos}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditing ? "Atualizando..." : "Criando..."}
                  </>
                ) : (
                  isEditing ? "Atualizar Produto" : "Criar Produto"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
