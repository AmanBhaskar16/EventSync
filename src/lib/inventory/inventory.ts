
export interface StockInfo {
  available: number;
  pct: number;
  isLow: boolean;
  barColor: string;
}

export function getStockInfo(totalQuantity: number, maintenanceQty: number, lowStockAlert: number): StockInfo {
  const available = totalQuantity - maintenanceQty;
  const pct = totalQuantity > 0 ? Math.round((available / totalQuantity) * 100) : 0;
  const isLow = available <= lowStockAlert;
  const barColor = pct > 50 ? "bg-green-500" : pct > 20 ? "bg-amber-500" : "bg-red-500";

  return { available, pct, isLow, barColor };
}