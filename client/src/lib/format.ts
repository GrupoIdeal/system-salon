export function formatDuration(mins?: number | null) {
  const m = Number(mins ?? 0) || 0;
  const hours = Math.floor(m / 60);
  const remaining = m % 60;
  if (hours > 0 && remaining > 0) return `${hours}h ${remaining}m`;
  if (hours > 0) return `${hours}h`;
  return `${remaining}m`;
}

export function formatServicePrice(
  price?: string | number | null,
  priceFrom?: boolean | null
) {
  const value = Number(price ?? 0) || 0;
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
  return (priceFrom ? "A partir de " : "") + formatted;
}
