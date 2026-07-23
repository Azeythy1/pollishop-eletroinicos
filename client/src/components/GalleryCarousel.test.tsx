import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GalleryCarousel } from "./GalleryCarousel";

describe("GalleryCarousel", () => {
  it("renders the carousel component", () => {
    render(<GalleryCarousel />);
    expect(screen.getByText("Moda Íntima Premium")).toBeDefined();
  });

  it("displays the first gallery item on initial render", () => {
    render(<GalleryCarousel />);
    expect(screen.getByText("Coleção exclusiva de lingerie e cuecas")).toBeDefined();
  });

  it("navigates to next image when next button is clicked", () => {
    render(<GalleryCarousel />);
    const nextButton = screen.getByLabelText("Próxima imagem");
    fireEvent.click(nextButton);
    expect(screen.getByText("Fitness & Esportes")).toBeDefined();
  });

  it("navigates to previous image when previous button is clicked", () => {
    render(<GalleryCarousel />);
    const prevButton = screen.getByLabelText("Imagem anterior");
    fireEvent.click(prevButton);
    fireEvent.click(prevButton);
    expect(screen.getByText("Vestiário Variado")).toBeDefined();
  });

  it("cycles through all 4 gallery items", () => {
    render(<GalleryCarousel />);
    const nextButton = screen.getByLabelText("Próxima imagem");

    expect(screen.getByText("Moda Íntima Premium")).toBeDefined();

    fireEvent.click(nextButton);
    expect(screen.getByText("Fitness & Esportes")).toBeDefined();

    fireEvent.click(nextButton);
    expect(screen.getByText("Eletrônicos")).toBeDefined();

    fireEvent.click(nextButton);
    expect(screen.getByText("Vestiário Variado")).toBeDefined();

    fireEvent.click(nextButton);
    expect(screen.getByText("Moda Íntima Premium")).toBeDefined();
  });

  it("displays all indicator dots", () => {
    render(<GalleryCarousel />);
    const indicators = screen.getAllByRole("button").filter((btn) =>
      btn.getAttribute("aria-label")?.includes("Ir para imagem")
    );
    expect(indicators).toHaveLength(4);
  });

  it("navigates to specific image when indicator is clicked", () => {
    render(<GalleryCarousel />);
    const indicators = screen.getAllByRole("button").filter((btn) =>
      btn.getAttribute("aria-label")?.includes("Ir para imagem")
    );
    fireEvent.click(indicators[2]);
    expect(screen.getByText("Eletrônicos")).toBeDefined();
  });

  it("displays all feature information", () => {
    render(<GalleryCarousel />);
    expect(screen.getByText("Qualidade Premium")).toBeDefined();
    expect(screen.getByText("Entrega Rápida")).toBeDefined();
    expect(screen.getByText("Atendimento")).toBeDefined();
  });

  it("displays feature descriptions", () => {
    render(<GalleryCarousel />);
    expect(screen.getByText("Produtos selecionados com cuidado")).toBeDefined();
    expect(screen.getByText("Compre com segurança via WhatsApp")).toBeDefined();
    expect(screen.getByText("Suporte direto no WhatsApp")).toBeDefined();
  });
});
