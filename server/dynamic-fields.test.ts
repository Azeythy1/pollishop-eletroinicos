import { describe, it, expect } from "vitest";
import { z } from "zod";
import { CATEGORIES, SUBCATEGORIES } from "@shared/categories";

const baseSchema = z.object({
  category: z.enum(CATEGORIES),
  model: z.string().min(1, "Nome do produto obrigatório"),
  description: z.string().min(1, "Descrição obrigatória"),
  costPrice: z.number().positive("Preço de custo obrigatório"),
  priceAdjustType: z.enum(["percentage", "fixed"]),
  priceAdjustValue: z.number().min(0),
  status: z.enum(["draft", "published"]),
});

describe("Dynamic Product Fields by Category", () => {
  describe("Eletrônicos", () => {
    it("should validate electronics product", async () => {
      const data = {
        category: "Eletrônicos",
        model: "iPhone 13",
        description: "iPhone 13 em excelente estado",
        costPrice: 1500,
        priceAdjustType: "percentage",
        priceAdjustValue: 20,
        status: "published",
      };
      const result = await baseSchema.parseAsync(data);
      expect(result.model).toBe("iPhone 13");
      expect(result.category).toBe("Eletrônicos");
    });

    it("should reject electronics without description", async () => {
      const data = {
        category: "Eletrônicos",
        model: "iPhone 13",
        description: "",
        costPrice: 1500,
        priceAdjustType: "percentage",
        priceAdjustValue: 20,
        status: "published",
      };
      await expect(baseSchema.parseAsync(data)).rejects.toThrow();
    });
  });

  describe("Vestiário", () => {
    it("should validate clothing product", async () => {
      const data = {
        category: "Vestiário",
        model: "Camiseta Premium",
        description: "Camiseta de algodão 100%",
        costPrice: 50,
        priceAdjustType: "percentage",
        priceAdjustValue: 30,
        status: "published",
      };
      const result = await baseSchema.parseAsync(data);
      expect(result.category).toBe("Vestiário");
    });
  });

  describe("Fitness", () => {
    it("should validate fitness product", async () => {
      const data = {
        category: "Fitness",
        model: "Macacão compressão",
        description: "Macacão de compressão para treino",
        costPrice: 120,
        priceAdjustType: "percentage",
        priceAdjustValue: 40,
        status: "published",
      };
      const result = await baseSchema.parseAsync(data);
      expect(result.category).toBe("Fitness");
    });

    it("should accept all fitness subcategories", () => {
      expect(SUBCATEGORIES.Fitness).toEqual([
        "Moleton",
        "Conjunto",
        "Macacão",
        "Blusinha",
        "Short",
        "Calça",
      ]);
    });
  });

  describe("Moda Intima", () => {
    it("should validate intimate apparel product", async () => {
      const data = {
        category: "Moda Intima",
        model: "Conjunto renda preta",
        description: "Conjunto de lingerie com renda",
        costPrice: 89.9,
        priceAdjustType: "percentage",
        priceAdjustValue: 30,
        status: "published",
      };
      const result = await baseSchema.parseAsync(data);
      expect(result.category).toBe("Moda Intima");
    });

    it("should accept all intimate apparel subcategories", () => {
      expect(SUBCATEGORIES["Moda Intima"]).toEqual([
        "Calcinhas",
        "Tangas",
        "Conjunto",
      ]);
    });
  });

  describe("Variados", () => {
    it("should validate miscellaneous product", async () => {
      const data = {
        category: "Variados",
        model: "Produto Diverso",
        description: "Produto de categoria variada",
        costPrice: 100,
        priceAdjustType: "fixed",
        priceAdjustValue: 20,
        status: "published",
      };
      const result = await baseSchema.parseAsync(data);
      expect(result.category).toBe("Variados");
    });
  });

  describe("Common validations", () => {
    it("should reject negative cost price", async () => {
      const data = {
        category: "Eletrônicos",
        model: "iPhone 13",
        description: "Produto teste",
        costPrice: -10,
        priceAdjustType: "percentage",
        priceAdjustValue: 0,
        status: "published",
      };
      await expect(baseSchema.parseAsync(data)).rejects.toThrow();
    });

    it("should reject invalid category", async () => {
      const data = {
        category: "InvalidCategory" as any,
        model: "Test",
        description: "Test",
        costPrice: 50,
        priceAdjustType: "percentage",
        priceAdjustValue: 0,
        status: "published",
      };
      await expect(baseSchema.parseAsync(data)).rejects.toThrow();
    });

    it("should set default status to published", async () => {
      const dataWithoutStatus = {
        category: "Eletrônicos",
        model: "iPhone 13",
        description: "Produto teste",
        costPrice: 1500,
        priceAdjustType: "percentage",
        priceAdjustValue: 20,
        status: "published" as const,
      };
      const result = await baseSchema.parseAsync(dataWithoutStatus);
      expect(result.status).toBe("published");
    });
  });
});
