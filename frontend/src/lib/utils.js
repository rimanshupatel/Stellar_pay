import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCrypto(amount, symbol = 'XLM') {
  return `${parseFloat(amount).toFixed(7)} ${symbol}`;
}

export function formatAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getStatusColor(status) {
  const colors = {
    success: 'bg-green-500',
    pending: 'bg-yellow-500',
    failed: 'bg-red-500',
    processing: 'bg-blue-500',
  };
  return colors[status.toLowerCase()] || colors.pending;
}
