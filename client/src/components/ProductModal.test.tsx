import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductModal } from "./ProductModal";

const mockProduct = {
  id: 1,
  model: "Camiseta Premium",
  description: "Camiseta 100% algodão, confortável e durável. Perfeita para uso diário.",
  cashPrice: 79.9,
  category: "Vestiário",
  photos: [
    { id: 1, url: "https://example.com/photo1.jpg", isPrimary: true },
    { id: 2, url: "https://example.com/photo2.jpg", isPrimary: false },
    { id: 3, url: "https://example.com/photo3.jpg", isPrimary: false },
  ],
  installmentOptions: [
    { installments: 0, rate: 0, perInstallment: 79.9, total: 79.9 },
    { installments: 3, rate: 5, perInstallment: 28.0, total: 84.0 },
    { installments: 6, rate: 8, perInstallment: 14.5, total: 87.0 },
    { installments: 12, rate: 12, perInstallment: 7.5, total: 90.0 },
  ],
  createdAt: new Date("2026-01-15"),
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

    expect(screen.getByText("Camiseta Premium")).toBeDefined();
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

    expect(screen.getByText("R$ 79,90")).toBeDefined();
  });

  it("displays product description", () => {
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

    expect(
      screen.getByText("Camiseta 100% algodão, confortável e durável. Perfeita para uso diário.")
    ).toBeDefined();
  });

  it("displays product category", () => {
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

    expect(screen.getByText("Vestiário")).toBeDefined();
  });

  it("navigates through photos", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    const { container } = render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    const nextButton = container.querySelector("button:has(svg)");
    if (nextButton) {
      fireEvent.click(nextButton);
    }

    expect(screen.getByText("2 / 3")).toBeDefined();
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

  it("displays installment options", () => {
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

    expect(screen.getByText("12x de")).toBeDefined();
  });

  it("calls onAddToCart when add to cart button is clicked", () => {
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

    const addToCartButton = screen.getByText("Adicionar ao Carrinho");
    fireEvent.click(addToCartButton);

    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it("renders with multiple photos", () => {
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

  it("renders with single photo", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    const singlePhotoProduct = {
      ...mockProduct,
      photos: [{ id: 1, url: "https://example.com/photo1.jpg", isPrimary: true }],
    };

    render(
      <ProductModal
        product={singlePhotoProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("1 / 1")).toBeDefined();
  });
});
