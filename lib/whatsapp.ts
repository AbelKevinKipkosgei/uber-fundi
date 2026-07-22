export function toInternationalKenyanNumber(phone: string): string {
  const digitsOnly = phone.replace(/[^\d]/g, "");
  if (digitsOnly.startsWith("254")) return digitsOnly;
  if (digitsOnly.startsWith("0")) return `254${digitsOnly.slice(1)}`;
  return digitsOnly;
}

export function whatsappLink(phone: string, providerName: string) {
  const normalized = toInternationalKenyanNumber(phone);
  const message = encodeURIComponent(
    `Hi ${providerName}, I found your profile on UberFundi and I'd like to enquire about your services.`,
  );
  return `https://wa.me/${normalized}?text=${message}`;
}
