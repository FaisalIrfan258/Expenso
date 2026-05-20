export const formatEuro = (amount: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits,
  }).format(Number.isFinite(amount) ? amount : 0);

export const parseAmount = (value: string) => {
  const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '');
  const parsed = Number.parseFloat(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
};
