import { describe, it, expect } from "vitest";

// Função auxiliar para calcular preço com juros (mesmo que em routers.ts)
function calcInstallmentPrice(cashPrice: number, rate: number, installments: number) {
  const total = cashPrice * (1 + rate / 100);
  const perInstallment = total / installments;
  return { total: parseFloat(total.toFixed(2)), perInstallment: parseFloat(perInstallment.toFixed(2)) };
}

describe("Checkout - Payment Calculations", () => {
  it("calculates PIX price correctly (no interest)", () => {
    const cashPrice = 1000;
    const result = calcInstallmentPrice(cashPrice, 0, 1);
    expect(result.total).toBe(1000);
    expect(result.perInstallment).toBe(1000);
  });

  it("calculates 1x installment with 4.5% rate", () => {
    const cashPrice = 1000;
    const result = calcInstallmentPrice(cashPrice, 4.5, 1);
    expect(result.total).toBe(1045);
    expect(result.perInstallment).toBe(1045);
  });

  it("calculates 3x installment with 6.5% rate", () => {
    const cashPrice = 1000;
    const result = calcInstallmentPrice(cashPrice, 6.5, 3);
    expect(result.total).toBe(1065);
    expect(result.perInstallment).toBe(355);
  });

  it("calculates 6x installment with 8.5% rate", () => {
    const cashPrice = 1000;
    const result = calcInstallmentPrice(cashPrice, 8.5, 6);
    expect(result.total).toBe(1085);
    expect(result.perInstallment).toBeCloseTo(180.83, 2);
  });

  it("calculates 12x installment with 14% rate", () => {
    const cashPrice = 1000;
    const result = calcInstallmentPrice(cashPrice, 14, 12);
    expect(result.total).toBe(1140);
    expect(result.perInstallment).toBe(95);
  });

  it("calculates 18x installment with 22% rate", () => {
    const cashPrice = 1000;
    const result = calcInstallmentPrice(cashPrice, 22, 18);
    expect(result.total).toBe(1220);
    expect(result.perInstallment).toBeCloseTo(67.78, 2);
  });

  it("handles multiple items total correctly", () => {
    const items = [
      { cashPrice: 1000, quantity: 1 },
      { cashPrice: 1500, quantity: 2 },
    ];
    const total = items.reduce((sum, item) => sum + item.cashPrice * item.quantity, 0);
    expect(total).toBe(4000);

    const result = calcInstallmentPrice(total, 14, 12);
    expect(result.total).toBe(4560);
    expect(result.perInstallment).toBe(380);
  });

  it("handles all standard installment rates", () => {
    const rates = [
      { installments: 1, rate: 4.5 },
      { installments: 2, rate: 5 },
      { installments: 3, rate: 6.5 },
      { installments: 4, rate: 6.5 },
      { installments: 5, rate: 8.5 },
      { installments: 6, rate: 8.5 },
      { installments: 7, rate: 10 },
      { installments: 8, rate: 10 },
      { installments: 9, rate: 12.5 },
      { installments: 10, rate: 12.5 },
      { installments: 11, rate: 14 },
      { installments: 12, rate: 14 },
      { installments: 13, rate: 18 },
      { installments: 14, rate: 18 },
      { installments: 15, rate: 18 },
      { installments: 16, rate: 20 },
      { installments: 17, rate: 20 },
      { installments: 18, rate: 22 },
    ];

    const cashPrice = 1000;
    rates.forEach(({ installments, rate }) => {
      const result = calcInstallmentPrice(cashPrice, rate, installments);
      expect(result.total).toBeGreaterThan(cashPrice);
      expect(result.perInstallment).toBeGreaterThan(0);
      expect(result.perInstallment * installments).toBeCloseTo(result.total, 0);
    });
  });

  it("calculates correctly with high-value products", () => {
    const cashPrice = 5000;
    const result = calcInstallmentPrice(cashPrice, 14, 12);
    expect(result.total).toBe(5700);
    expect(result.perInstallment).toBe(475);
  });

  it("calculates correctly with low-value products", () => {
    const cashPrice = 100;
    const result = calcInstallmentPrice(cashPrice, 14, 12);
    expect(result.total).toBe(114);
    expect(result.perInstallment).toBeCloseTo(9.5, 1);
  });

  it("maintains precision with decimal prices", () => {
    const cashPrice = 1234.56;
    const result = calcInstallmentPrice(cashPrice, 14, 12);
    expect(result.total).toBeCloseTo(1407.4, 1);
    expect(result.perInstallment).toBeCloseTo(117.28, 2);
  });

  it("calculates debit rate (2%)", () => {
    const cashPrice = 1000;
    const result = calcInstallmentPrice(cashPrice, 2, 1);
    expect(result.total).toBe(1020);
    expect(result.perInstallment).toBe(1020);
  });

  it("handles edge case: 0 rate", () => {
    const cashPrice = 1000;
    const result = calcInstallmentPrice(cashPrice, 0, 12);
    expect(result.total).toBe(1000);
    expect(result.perInstallment).toBeCloseTo(83.33, 2);
  });
});
