/**
 * AccessibilityBar
 * Barra de acessibilidade visual com 3 controles:
 *   +A  → aumenta tamanho da fonte (salvo em localStorage)
 *   -A  → diminui tamanho da fonte
 *   Alto Contraste → aplica classe .high-contrast na tag <html>
 *
 * O tamanho de fonte é aplicado como `font-size` no elemento <html>,
 * variando de 12px (mínimo) a 22px (máximo), padrão 16px.
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const FONT_SIZE_KEY = "a11y_fontSize";
const CONTRAST_KEY = "a11y_highContrast";
const FONT_MIN = 12;
const FONT_MAX = 22;
const FONT_STEP = 2;
const FONT_DEFAULT = 16;

function getStoredFontSize(): number {
  const stored = localStorage.getItem(FONT_SIZE_KEY);
  return stored ? parseInt(stored, 10) : FONT_DEFAULT;
}

function getStoredContrast(): boolean {
  return localStorage.getItem(CONTRAST_KEY) === "true";
}

export function AccessibilityBar() {
  const [fontSize, setFontSize] = useState<number>(getStoredFontSize);
  const [highContrast, setHighContrast] = useState<boolean>(getStoredContrast);

  // Aplica o tamanho de fonte no elemento raiz sempre que mudar
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem(FONT_SIZE_KEY, String(fontSize));
  }, [fontSize]);

  // Aplica/remove a classe .high-contrast no elemento raiz sempre que mudar
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
    localStorage.setItem(CONTRAST_KEY, String(highContrast));
  }, [highContrast]);

  // Inicialização: aplica preferências salvas ao montar o componente
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    }
  }, []);

  return (
    <div
      className="flex items-center gap-1 text-xs"
      role="toolbar"
      aria-label="Barra de acessibilidade"
    >
      {/* Aumentar fonte */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 font-bold text-sm"
        onClick={() =>
          setFontSize(prev => Math.min(prev + FONT_STEP, FONT_MAX))
        }
        disabled={fontSize >= FONT_MAX}
        title="Aumentar tamanho do texto"
        aria-label="Aumentar tamanho do texto"
      >
        +A
      </Button>

      {/* Diminuir fonte */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 font-bold text-sm"
        onClick={() =>
          setFontSize(prev => Math.max(prev - FONT_STEP, FONT_MIN))
        }
        disabled={fontSize <= FONT_MIN}
        title="Diminuir tamanho do texto"
        aria-label="Diminuir tamanho do texto"
      >
        -A
      </Button>

      {/* Alto contraste */}
      <Button
        variant={highContrast ? "default" : "ghost"}
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => setHighContrast(prev => !prev)}
        title="Alternar alto contraste"
        aria-label="Alternar alto contraste"
        aria-pressed={highContrast}
      >
        ◑ Contraste
      </Button>
    </div>
  );
}
