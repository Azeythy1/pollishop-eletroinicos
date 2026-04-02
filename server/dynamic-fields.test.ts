import { describe, it, expect } from "vitest";
import { z } from "zod";

// Reproduzir os schemas do formulário
const baseSchema = z.object({
  category: z.string().min(1, "Selecione a categoria"),
  color: z.string().optional(),
  condition: z.enum(["excelente", "bom", "regular"]),
  costPrice: z.number().positive("Preço de custo obrigatório"),
  priceAdjustType: z.enum(["percentage", "fixed"]),
  priceAdjustValue: z.number().min(0),
  status: z.enum(["draft", "published"]),
  notes: z.string().optional(),
}).passthrough();

const smartphoneSchema = baseSchema.extend({
  model: z.string().min(1, "Selecione o modelo"),
  storage: z.string().min(1, "Selecione a memória"),
  batteryHealth: z.number().int().min(1).max(100),
  repairs: z.string().optional(),
});

const tabletSchema = baseSchema.extend({
  model: z.string().min(1, "Selecione o modelo"),
  storage: z.string().min(1, "Selecione a memória"),
  batteryHealth: z.number().int().min(1).max(100),
  repairs: z.string().optional(),
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
});

const peripheralSchema = baseSchema.extend({
  model: z.string().min(1, "Nome do produto obrigatório"),
  brand: z.string().min(1, "Marca obrigatória"),
  itemType: z.string().min(1, "Tipo obrigatório"),
  specifications: z.string().optional(),
});

const accessorySchema = baseSchema.extend({
  model: z.string().min(1, "Nome do produto obrigatório"),
  itemType: z.string().min(1, "Tipo obrigatório"),
  compatibility: z.string().min(1, "Compatibilidade obrigatória"),
  specifications: z.string().optional(),
});

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

describe("Dynamic Product Fields by Category", () => {
  describe("Smartphones", () => {
    it("should validate smartphone with all required fields", async () => {
      const schema = getSchemaForCategory("Smartphones");
      const data = {
        category: "Smartphones",
        model: "iPhone 15 Pro",
        storage: "256GB",
        batteryHealth: 85,
        color: "Preto",
        condition: "excelente",
        costPrice: 3000,
        priceAdjustType: "percentage",
        priceAdjustValue: 15,
        status: "published",
      };
      const result = await schema.parseAsync(data);
      expect(result.model).toBe("iPhone 15 Pro");
      expect(result.storage).toBe("256GB");
      expect(result.batteryHealth).toBe(85);
    });

    it("should reject smartphone without model", async () => {
      const schema = getSchemaForCategory("Smartphones");
      const data = {
        category: "Smartphones",
        storage: "256GB",
        batteryHealth: 85,
        condition: "bom",
        costPrice: 3000,
        priceAdjustType: "percentage",
        priceAdjustValue: 15,
        status: "published",
      };
      await expect(schema.parseAsync(data)).rejects.toThrow();
    });

    it("should reject smartphone without storage", async () => {
      const schema = getSchemaForCategory("Smartphones");
      const data = {
        category: "Smartphones",
        model: "iPhone 15 Pro",
        batteryHealth: 85,
        condition: "bom",
        costPrice: 3000,
        priceAdjustType: "percentage",
        priceAdjustValue: 15,
        status: "published",
      };
      await expect(schema.parseAsync(data)).rejects.toThrow();
    });
  });

  describe("Notebook", () => {
    it("should validate notebook with all required fields", async () => {
      const schema = getSchemaForCategory("Notebook");
      const data = {
        category: "Notebook",
        model: "Dell XPS 13",
        brand: "Dell",
        processor: "Intel i7 13th Gen",
        ram: "16GB DDR5",
        storageCapacity: "SSD 512GB",
        screen: "13.3 polegadas",
        gpu: "Intel Iris Xe",
        color: "Prata",
        condition: "excelente",
        costPrice: 5000,
        priceAdjustType: "percentage",
        priceAdjustValue: 20,
        status: "published",
      };
      const result = await schema.parseAsync(data);
      expect(result.model).toBe("Dell XPS 13");
      expect(result.brand).toBe("Dell");
      expect(result.processor).toBe("Intel i7 13th Gen");
      expect(result.ram).toBe("16GB DDR5");
      expect(result.storageCapacity).toBe("SSD 512GB");
      expect(result.screen).toBe("13.3 polegadas");
    });

    it("should reject notebook without brand", async () => {
      const schema = getSchemaForCategory("Notebook");
      const data = {
        category: "Notebook",
        model: "Dell XPS 13",
        processor: "Intel i7 13th Gen",
        ram: "16GB DDR5",
        storageCapacity: "SSD 512GB",
        screen: "13.3 polegadas",
        condition: "bom",
        costPrice: 5000,
        priceAdjustType: "percentage",
        priceAdjustValue: 20,
        status: "published",
      };
      await expect(schema.parseAsync(data)).rejects.toThrow();
    });

    it("should reject notebook without processor", async () => {
      const schema = getSchemaForCategory("Notebook");
      const data = {
        category: "Notebook",
        model: "Dell XPS 13",
        brand: "Dell",
        ram: "16GB DDR5",
        storageCapacity: "SSD 512GB",
        screen: "13.3 polegadas",
        condition: "bom",
        costPrice: 5000,
        priceAdjustType: "percentage",
        priceAdjustValue: 20,
        status: "published",
      };
      await expect(schema.parseAsync(data)).rejects.toThrow();
    });
  });

  describe("Computadores", () => {
    it("should validate computer with all required fields", async () => {
      const schema = getSchemaForCategory("Computadores");
      const data = {
        category: "Computadores",
        model: "PC Gamer Pro",
        brand: "Custom Build",
        processor: "Intel i9 13th Gen",
        ram: "32GB DDR5",
        storageCapacity: "SSD 1TB + HDD 2TB",
        gpu: "NVIDIA RTX 4070",
        powerSupply: "850W 80+ Gold",
        color: "Preto",
        condition: "excelente",
        costPrice: 8000,
        priceAdjustType: "percentage",
        priceAdjustValue: 25,
        status: "published",
      };
      const result = await schema.parseAsync(data);
      expect(result.model).toBe("PC Gamer Pro");
      expect(result.gpu).toBe("NVIDIA RTX 4070");
      expect(result.powerSupply).toBe("850W 80+ Gold");
    });

    it("should reject computer without GPU", async () => {
      const schema = getSchemaForCategory("Computadores");
      const data = {
        category: "Computadores",
        model: "PC Gamer Pro",
        brand: "Custom Build",
        processor: "Intel i9 13th Gen",
        ram: "32GB DDR5",
        storageCapacity: "SSD 1TB + HDD 2TB",
        powerSupply: "850W 80+ Gold",
        condition: "bom",
        costPrice: 8000,
        priceAdjustType: "percentage",
        priceAdjustValue: 25,
        status: "published",
      };
      await expect(schema.parseAsync(data)).rejects.toThrow();
    });

    it("should reject computer without power supply", async () => {
      const schema = getSchemaForCategory("Computadores");
      const data = {
        category: "Computadores",
        model: "PC Gamer Pro",
        brand: "Custom Build",
        processor: "Intel i9 13th Gen",
        ram: "32GB DDR5",
        storageCapacity: "SSD 1TB + HDD 2TB",
        gpu: "NVIDIA RTX 4070",
        condition: "bom",
        costPrice: 8000,
        priceAdjustType: "percentage",
        priceAdjustValue: 25,
        status: "published",
      };
      await expect(schema.parseAsync(data)).rejects.toThrow();
    });
  });

  describe("Periféricos", () => {
    it("should validate peripheral with all required fields", async () => {
      const schema = getSchemaForCategory("Periféricos");
      const data = {
        category: "Periféricos",
        model: "Mouse Gamer RGB",
        brand: "Logitech",
        itemType: "Mouse",
        specifications: "16000 DPI, RGB, Wireless",
        color: "Preto",
        condition: "excelente",
        costPrice: 200,
        priceAdjustType: "percentage",
        priceAdjustValue: 30,
        status: "published",
      };
      const result = await schema.parseAsync(data);
      expect(result.model).toBe("Mouse Gamer RGB");
      expect(result.brand).toBe("Logitech");
      expect(result.itemType).toBe("Mouse");
    });

    it("should reject peripheral without brand", async () => {
      const schema = getSchemaForCategory("Periféricos");
      const data = {
        category: "Periféricos",
        model: "Mouse Gamer RGB",
        itemType: "Mouse",
        condition: "bom",
        costPrice: 200,
        priceAdjustType: "percentage",
        priceAdjustValue: 30,
        status: "published",
      };
      await expect(schema.parseAsync(data)).rejects.toThrow();
    });
  });

  describe("Acessórios", () => {
    it("should validate accessory with all required fields", async () => {
      const schema = getSchemaForCategory("Acessórios");
      const data = {
        category: "Acessórios",
        model: "Capa de iPhone 15",
        itemType: "Capa",
        compatibility: "iPhone 15",
        specifications: "Silicone, Anti-impacto",
        color: "Preto",
        condition: "excelente",
        costPrice: 50,
        priceAdjustType: "percentage",
        priceAdjustValue: 40,
        status: "published",
      };
      const result = await schema.parseAsync(data);
      expect(result.model).toBe("Capa de iPhone 15");
      expect(result.itemType).toBe("Capa");
      expect(result.compatibility).toBe("iPhone 15");
    });

    it("should reject accessory without compatibility", async () => {
      const schema = getSchemaForCategory("Acessórios");
      const data = {
        category: "Acessórios",
        model: "Capa de iPhone 15",
        itemType: "Capa",
        condition: "bom",
        costPrice: 50,
        priceAdjustType: "percentage",
        priceAdjustValue: 40,
        status: "published",
      };
      await expect(schema.parseAsync(data)).rejects.toThrow();
    });

    it("should reject accessory without itemType", async () => {
      const schema = getSchemaForCategory("Acessórios");
      const data = {
        category: "Acessórios",
        model: "Capa de iPhone 15",
        compatibility: "iPhone 15",
        condition: "bom",
        costPrice: 50,
        priceAdjustType: "percentage",
        priceAdjustValue: 40,
        status: "published",
      };
      await expect(schema.parseAsync(data)).rejects.toThrow();
    });
  });

  describe("Common fields validation", () => {
    it("should reject any category without costPrice", async () => {
      const schema = getSchemaForCategory("Smartphones");
      const data = {
        category: "Smartphones",
        model: "iPhone 15 Pro",
        storage: "256GB",
        batteryHealth: 85,
        condition: "bom",
        priceAdjustType: "percentage",
        priceAdjustValue: 15,
        status: "published",
      };
      await expect(schema.parseAsync(data)).rejects.toThrow();
    });

    it("should reject any category with invalid condition", async () => {
      const schema = getSchemaForCategory("Notebook");
      const data = {
        category: "Notebook",
        model: "Dell XPS 13",
        brand: "Dell",
        processor: "Intel i7 13th Gen",
        ram: "16GB DDR5",
        storageCapacity: "SSD 512GB",
        screen: "13.3 polegadas",
        condition: "muito bom",
        costPrice: 5000,
        priceAdjustType: "percentage",
        priceAdjustValue: 20,
        status: "published",
      };
      await expect(schema.parseAsync(data)).rejects.toThrow();
    });

    it("should accept optional fields", async () => {
      const schema = getSchemaForCategory("Smartphones");
      const data = {
        category: "Smartphones",
        model: "iPhone 15 Pro",
        storage: "256GB",
        batteryHealth: 85,
        condition: "bom",
        costPrice: 3000,
        priceAdjustType: "percentage",
        priceAdjustValue: 15,
        status: "published",
        // color, repairs, notes are optional
      };
      const result = await schema.parseAsync(data);
      expect(result.model).toBe("iPhone 15 Pro");
    });
  });
});
