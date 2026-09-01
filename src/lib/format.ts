// filepath: src/lib/format.ts
export function formatMoney(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  } catch {
    return `${currency || "USD"} ${amount || 0}`;
  }
}

export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatDateShort(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function whatsappHref(message: string, phone?: string): string {
  const targetPhone = phone || import.meta.env.PUBLIC_WHATSAPP_NUMBER || "59899000000";
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

export function defaultWhatsappMessage(client: string, title: string): string {
  return `Hola Amargo, soy ${client}. Quiero avanzar con la propuesta "${title}".`;
}
