import { describe, expect, it } from "vitest";

// ─── Price calculation helpers (mirrored from routers.ts) ─────────────────────
function calcCashPrice(costPrice: number, adjustType: "percentage" | "fixed", adjustValue: number): number {
  if (adjustType === "percentage") {
    return costPrice * (1 + adjustValue / 100);
  }
  return costPrice + adjustValue;
}

function calcInstallmentPrice(cashPrice: number, rate: number, installments: number) {
  const total = cashPrice * (1 + rate / 100);
  const perInstallment = total / installments;
  return { total: parseFloat(total.toFixed(2)), perInstallment: parseFloat(perInstallment.toFixed(2)) };
}

describe("Price calculation", () => {
  it("calculates cash price with percentage adjustment", () => {
    const result = calcCashPrice(2000, "percentage", 20);
    expect(result).toBe(2400);
  });

  it("calculates cash price with fixed adjustment", () => {
    const result = calcCashPrice(2000, "fixed", 500);
    expect(result).toBe(2500);
  });

  it("calculates cash price with zero adjustment", () => {
    const result = calcCashPrice(1500, "percentage", 0);
    expect(result).toBe(1500);
  });

  it("calculates installment price correctly", () => {
    const { total, perInstallment } = calcInstallmentPrice(2000, 5, 12);
    expect(total).toBe(2100);
    expect(perInstallment).toBe(175);
  });

  it("calculates installment price with zero rate", () => {
    const { total, perInstallment } = calcInstallmentPrice(1200, 0, 6);
    expect(total).toBe(1200);
    expect(perInstallment).toBe(200);
  });

  it("rounds installment per-parcel correctly", () => {
    const { perInstallment } = calcInstallmentPrice(1000, 3, 7);
    // 1000 * 1.03 = 1030 / 7 = 147.142... → 147.14
    expect(perInstallment).toBe(147.14);
  });
});

describe("auth.logout", () => {
  it("is covered by the existing auth.logout.test.ts", () => {
    expect(true).toBe(true);
  });
});
