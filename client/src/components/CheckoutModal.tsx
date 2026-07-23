import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MessageCircle, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import React, { useState } from "react";

export type PaymentMethod = "pix" | "installment";

export interface InstallmentOption {
  installments: number;
  rate: number;
  total: number;
  perInstallment: number;
}

export interface CartItemForCheckout {
  id: number;
  model: string;
  cashPrice: number;
  quantity: number;
  installmentOptions: InstallmentOption[];
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItemForCheckout[];
  total: number;
  onConfirm: (paymentMethod: PaymentMethod, selectedInstallment?: InstallmentOption) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function CheckoutModal({
  isOpen,
  onClose,
  items,
  total,
  onConfirm,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [selectedInstallment, setSelectedInstallment] = useState<InstallmentOption | null>(null);
  const [expandedInstallments, setExpandedInstallments] = useState(false);

  // Collect all unique installment options from all items
  const allInstallmentOptions = React.useMemo(() => {
    const optionsMap = new Map<number, InstallmentOption>();
    items.forEach(item => {
      item.installmentOptions.forEach(opt => {
        if (!optionsMap.has(opt.installments)) {
          optionsMap.set(opt.installments, opt);
        }
      });
    });
    return Array.from(optionsMap.values()).sort((a, b) => a.installments - b.installments);
  }, [items]);

  // Calculate total for selected installment
  const installmentTotal = React.useMemo(() => {
    if (!selectedInstallment) return total;
    // Recalculate based on the rate and installments
    const baseTotal = total * (1 + selectedInstallment.rate / 100);
    return parseFloat(baseTotal.toFixed(2));
  }, [selectedInstallment, total]);

  const handleConfirm = () => {
    if (paymentMethod === "installment" && !selectedInstallment) {
      toast.error("Selecione uma opção de parcelamento");
      return;
    }
    onConfirm(paymentMethod, selectedInstallment || undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Escolha a Forma de Pagamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* PIX Option */}
          <div className="space-y-3">
            <div 
              className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-all"
              onClick={() => setPaymentMethod("pix")}
              style={{
                borderColor: paymentMethod === "pix" ? "hsl(var(--primary))" : "hsl(var(--border))",
                backgroundColor: paymentMethod === "pix" ? "hsl(var(--primary) / 0.05)" : "transparent"
              }}
            >
              <input
                type="radio"
                id="pix"
                name="payment"
                value="pix"
                checked={paymentMethod === "pix"}
                onChange={() => setPaymentMethod("pix")}
                className="w-4 h-4"
              />
              <Label htmlFor="pix" className="cursor-pointer flex-1 m-0">
                <div className="font-semibold text-foreground">PIX - À Vista</div>
                <div className="text-sm text-muted-foreground">Pague agora e aproveite o melhor preço</div>
              </Label>
            </div>
            {paymentMethod === "pix" && (
              <div className="ml-6 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground">Total:</span>
                  <span className="font-bold text-lg text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Installment Option */}
          <div className="space-y-3">
            <div 
              className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-all"
              onClick={() => setPaymentMethod("installment")}
              style={{
                borderColor: paymentMethod === "installment" ? "hsl(var(--primary))" : "hsl(var(--border))",
                backgroundColor: paymentMethod === "installment" ? "hsl(var(--primary) / 0.05)" : "transparent"
              }}
            >
              <input
                type="radio"
                id="installment"
                name="payment"
                value="installment"
                checked={paymentMethod === "installment"}
                onChange={() => setPaymentMethod("installment")}
                className="w-4 h-4"
              />
              <Label htmlFor="installment" className="cursor-pointer flex-1 m-0">
                <div className="font-semibold text-foreground">Parcelado</div>
                <div className="text-sm text-muted-foreground">Divida em até {allInstallmentOptions.length} vezes</div>
              </Label>
            </div>

            {paymentMethod === "installment" && (
              <div className="ml-6 space-y-3">
                {/* Installment Selector */}
                <button
                  onClick={() => setExpandedInstallments(!expandedInstallments)}
                  className="w-full p-3 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors flex items-center justify-between"
                >
                  <span className="text-sm text-foreground">
                    {selectedInstallment
                      ? `${selectedInstallment.installments}x de ${formatCurrency(selectedInstallment.perInstallment)}`
                      : "Selecione o número de parcelas"}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedInstallments ? "rotate-180" : ""}`} />
                </button>

                {/* Installment Options */}
                {expandedInstallments && (
                  <div className="space-y-2 max-h-64 overflow-y-auto p-2 rounded-lg border border-border bg-muted/30">
                    {allInstallmentOptions.map(option => {
                      const itemTotal = total * (1 + option.rate / 100);
                      const perInstallment = itemTotal / option.installments;
                      return (
                        <button
                          key={option.installments}
                          onClick={() => {
                            setSelectedInstallment(option);
                            setExpandedInstallments(false);
                          }}
                          className={`w-full p-2 rounded text-sm text-left transition-colors ${
                            selectedInstallment?.installments === option.installments
                              ? "bg-primary/20 border border-primary text-foreground font-medium"
                              : "bg-background hover:bg-muted border border-transparent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>
                              {option.installments}x de {formatCurrency(perInstallment)}
                            </span>
                            {option.rate > 0 && (
                              <span className="text-xs text-muted-foreground">+{option.rate}%</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Total with installment */}
                {selectedInstallment && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-foreground">Total com juros:</span>
                      <span className="font-bold text-lg text-primary">{formatCurrency(installmentTotal)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedInstallment.installments}x de {formatCurrency(installmentTotal / selectedInstallment.installments)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="text-sm text-muted-foreground">Resumo do Pedido:</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-foreground">{item.model} (Qtd: {item.quantity})</span>
                  <span className="font-medium text-foreground">{formatCurrency(item.cashPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 gap-2"
              onClick={handleConfirm}
            >
              <MessageCircle className="w-4 h-4" />
              Ir para WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
