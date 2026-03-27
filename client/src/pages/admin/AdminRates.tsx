import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, PercentCircle, Info, Pencil, Check, X } from "lucide-react";

const schema = z.object({
  installments: z.number().int().min(2, "Mínimo 2 parcelas").max(24, "Máximo 24 parcelas"),
  rate: z.number().min(0, "Taxa não pode ser negativa").max(100, "Taxa máxima 100%"),
});
type FormData = z.infer<typeof schema>;

function EditRateRow({ rate, onSave, onCancel }: {
  rate: { id: number; installments: number; rate: number };
  onSave: (id: number, installments: number, rate: number) => void;
  onCancel: () => void;
}) {
  const [installments, setInstallments] = useState(rate.installments);
  const [rateVal, setRateVal] = useState(rate.rate);
  return (
    <div className="flex items-center gap-3">
      <Input
        type="number"
        value={installments}
        onChange={e => setInstallments(parseInt(e.target.value))}
        className="w-20 h-8 text-sm"
        min={2}
        max={24}
      />
      <Input
        type="number"
        value={rateVal}
        onChange={e => setRateVal(parseFloat(e.target.value))}
        className="w-24 h-8 text-sm"
        step="0.01"
        min={0}
      />
      <button onClick={() => onSave(rate.id, installments, rateVal)} className="text-emerald-400 hover:text-emerald-300">
        <Check className="w-4 h-4" />
      </button>
      <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function AdminRates() {
  const utils = trpc.useUtils();
  const { data: rates, isLoading } = trpc.admin.listRates.useQuery();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const createMutation = trpc.admin.createRate.useMutation({
    onSuccess: () => {
      toast.success("Taxa criada com sucesso");
      utils.admin.listRates.invalidate();
      reset();
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const updateMutation = trpc.admin.updateRate.useMutation({
    onSuccess: () => {
      toast.success("Taxa atualizada");
      utils.admin.listRates.invalidate();
      setEditId(null);
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const deleteMutation = trpc.admin.deleteRate.useMutation({
    onSuccess: () => {
      toast.success("Taxa excluída");
      utils.admin.listRates.invalidate();
      setDeleteId(null);
    },
    onError: () => toast.error("Erro ao excluir taxa"),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { installments: 2, rate: 0 },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Taxas de Parcelamento</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure as taxas de juros para cada número de parcelas</p>
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-6 flex items-start gap-3">
        <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <div className="text-sm text-muted-foreground">
          <p>As taxas configuradas aqui são aplicadas sobre o <strong className="text-foreground">preço à vista</strong> de cada produto.</p>
          <p className="mt-1">Exemplo: preço à vista R$ 2.000 com taxa de 5% em 12x = R$ 2.100 total → R$ 175/parcela</p>
        </div>
      </div>

      {/* Add form */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          Adicionar Nova Taxa
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-4">
          <div className="space-y-2 flex-1 min-w-32">
            <Label>Nº de Parcelas</Label>
            <Input
              type="number"
              min={2}
              max={24}
              placeholder="Ex: 12"
              className={errors.installments ? "border-destructive" : ""}
              {...register("installments", { valueAsNumber: true })}
            />
            {errors.installments && <p className="text-xs text-destructive">{errors.installments.message}</p>}
          </div>
          <div className="space-y-2 flex-1 min-w-32">
            <Label>Taxa de Juros (%)</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                min={0}
                placeholder="Ex: 2.99"
                className={`pr-8 ${errors.rate ? "border-destructive" : ""}`}
                {...register("rate", { valueAsNumber: true })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
            </div>
            {errors.rate && <p className="text-xs text-destructive">{errors.rate.message}</p>}
          </div>
          <Button type="submit" className="gap-2 h-10" disabled={createMutation.isPending}>
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? "Adicionando..." : "Adicionar"}
          </Button>
        </form>
      </div>

      {/* Rates list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <PercentCircle className="w-4 h-4 text-primary" />
            Taxas Cadastradas
          </h2>
        </div>

        {isLoading && (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-muted shimmer" />
            ))}
          </div>
        )}

        {!isLoading && (!rates || rates.length === 0) && (
          <div className="py-12 text-center">
            <PercentCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhuma taxa cadastrada ainda.</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Adicione taxas usando o formulário acima.</p>
          </div>
        )}

        {!isLoading && rates && rates.length > 0 && (
          <div className="divide-y divide-border">
            {rates.map((rate, idx) => (
              <motion.div
                key={rate.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-4 px-6 py-4"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">{rate.installments}x</span>
                </div>

                <div className="flex-1">
                  {editId === rate.id ? (
                    <EditRateRow
                      rate={rate}
                      onSave={(id, installments, rateVal) => updateMutation.mutate({ id, installments, rate: rateVal })}
                      onCancel={() => setEditId(null)}
                    />
                  ) : (
                    <>
                      <p className="font-medium text-foreground">{rate.installments} parcelas</p>
                      <p className="text-sm text-muted-foreground">Taxa: {rate.rate}% ao mês</p>
                    </>
                  )}
                </div>

                {editId !== rate.id && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rate.isActive}
                        onCheckedChange={v => updateMutation.mutate({ id: rate.id, isActive: v })}
                        className="scale-90"
                      />
                      <span className="text-xs text-muted-foreground">{rate.isActive ? "Ativa" : "Inativa"}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setEditId(rate.id)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteId(rate.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir taxa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta taxa será removida permanentemente. Produtos que a utilizam não serão afetados imediatamente, mas a opção de parcelamento não será mais exibida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
