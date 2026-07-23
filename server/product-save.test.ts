import { describe, it, expect, vi } from "vitest";
import { z } from "zod";

describe("Product Save Validation", () => {
  // Simular o schema do formulário
  const productSchema = z.object({
    category: z.enum(["Eletrônicos", "Vestiário", "Fitness", "Moda Intima", "Variados"]),
    model: z.string().min(1, "Modelo é obrigatório"),
    description: z.string().min(1, "Descrição é obrigatória"),
    costPrice: z.number().positive("Preço de custo deve ser positivo"),
    priceAdjustType: z.enum(["percentage", "fixed"]).default("percentage"),
    priceAdjustValue: z.number().min(0).default(0),
    status: z.enum(["draft", "published"]).default("published"),
    photos: z.array(z.object({ url: z.string(), isPrimary: z.boolean() })).min(1, "Pelo menos uma foto é obrigatória"),
  });

  it("should accept valid product data", () => {
    const validData = {
      category: "Eletrônicos",
      model: "iPhone 13",
      description: "iPhone 13 em excelente estado",
      costPrice: 1500,
      priceAdjustType: "percentage",
      priceAdjustValue: 20,
      status: "published",
      photos: [{ url: "https://example.com/photo.jpg", isPrimary: true }],
    };

    const result = productSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject product without description", () => {
    const invalidData = {
      category: "Eletrônicos",
      model: "iPhone 13",
      description: "",
      costPrice: 1500,
      priceAdjustType: "percentage",
      priceAdjustValue: 20,
      status: "published",
      photos: [{ url: "https://example.com/photo.jpg", isPrimary: true }],
    };

    const result = productSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Descrição");
    }
  });

  it("should reject product without photos", () => {
    const invalidData = {
      category: "Eletrônicos",
      model: "iPhone 13",
      description: "iPhone 13 em excelente estado",
      costPrice: 1500,
      priceAdjustType: "percentage",
      priceAdjustValue: 20,
      status: "published",
      photos: [],
    };

    const result = productSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("foto");
    }
  });

  it("should reject product with invalid cost price", () => {
    const invalidData = {
      category: "Eletrônicos",
      model: "iPhone 13",
      description: "iPhone 13 em excelente estado",
      costPrice: -100,
      priceAdjustType: "percentage",
      priceAdjustValue: 20,
      status: "published",
      photos: [{ url: "https://example.com/photo.jpg", isPrimary: true }],
    };

    const result = productSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should set default status to published", () => {
    const dataWithoutStatus = {
      category: "Eletrônicos",
      model: "iPhone 13",
      description: "iPhone 13 em excelente estado",
      costPrice: 1500,
      priceAdjustType: "percentage",
      priceAdjustValue: 20,
      photos: [{ url: "https://example.com/photo.jpg", isPrimary: true }],
    };

    const result = productSchema.safeParse(dataWithoutStatus);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("published");
    }
  });
});
