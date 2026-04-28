import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductModal } from "./ProductModal";

const mockProduct = {
  id: 1,
  model: "iPhone 12",
  storage: "64GB",
  cashPrice: 1499.00,
  condition: "excelente",
  batteryHealth: 100,
  repairs: "Tela e Bateria",
  category: "Smartphones",
  processor: "A14 Bionic",
  ram: "4GB",
  gpu: "Apple GPU",
  screen: "6.1 polegadas",
  brand: "Apple",
  itemType: "Smartphone",
  specifications: "iOS 15+",
  compatibility: "Universal",
  photos: [
    { id: 1, url: "https://example.com/photo1.jpg", isPrimary: true },
    { id: 2, url: "https://example.com/photo2.jpg", isPrimary: false },
    { id: 3, url: "https://example.com/photo3.jpg", isPrimary: false },
  ],
  installmentOptions: [
    { installments: 0, rate: 0, perInstallment: 1499.00, total: 1499.00 },
    { installments: 3, rate: 5, perInstallment: 520.00, total: 1560.00 },
    { installments: 6, rate: 8, perInstallment: 268.00, total: 1608.00 },
    { installments: 12, rate: 12, perInstallment: 142.41, total: 1708.92 },
  ],
};

describe("ProductModal", () => {
  it("renders modal when isOpen is true", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("iPhone 12 64GB")).toBeDefined();
  });

  it("displays product price correctly", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("R$ 1.499,00")).toBeDefined();
  });

  it("displays 12x installment option when available", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("Ou 12x de")).toBeDefined();
    expect(screen.getByText("R$ 142,41")).toBeDefined();
  });

  it("displays product condition", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("excelente")).toBeDefined();
  });

  it("displays battery health when available", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("100")).toBeDefined();
  });

  it("displays repair history when available", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("Tela e Bateria")).toBeDefined();
  });

  it("displays category-specific details", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("A14 Bionic")).toBeDefined();
    expect(screen.getByText("4GB")).toBeDefined();
    expect(screen.getByText("Apple GPU")).toBeDefined();
    expect(screen.getByText("6.1 polegadas")).toBeDefined();
  });

  it("displays photo counter when multiple photos exist", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("1 / 3")).toBeDefined();
  });

  it("calls onAddToCart when add button is clicked", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    const addButton = screen.getByText("Adicionar ao Carrinho");
    fireEvent.click(addButton);

    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it("calls onClose when close button is clicked", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    const closeButton = screen.getByText("Fechar");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onClose after adding to cart", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    const addButton = screen.getByText("Adicionar ao Carrinho");
    fireEvent.click(addButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("handles products with no photos", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();
    const productNoPhotos = { ...mockProduct, photos: [] };

    render(
      <ProductModal
        product={productNoPhotos}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("Sem fotos")).toBeDefined();
  });

  it("handles products without optional fields", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();
    const minimalProduct = {
      id: 1,
      model: "iPhone 12",
      storage: "64GB",
      cashPrice: 1499.00,
      condition: "bom",
      batteryHealth: null,
      repairs: undefined,
      photos: [{ id: 1, url: "https://example.com/photo1.jpg", isPrimary: true }],
      installmentOptions: [
        { installments: 0, rate: 0, perInstallment: 1499.00, total: 1499.00 },
      ],
    };

    render(
      <ProductModal
        product={minimalProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("iPhone 12 64GB")).toBeDefined();
    expect(screen.getByText("bom")).toBeDefined();
  });
});
