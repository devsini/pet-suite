import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PHONE_COUNTRY_CODE, QR_DATA_PREFIX } from './constants';

export function cn(...inputs: ClassValue[]) {
  const normalized = clsx(inputs);
  const deduped = [...new Set(normalized.split(/\s+/).filter(Boolean))].join(' ');
  return twMerge(deduped);
}

export function formatCurrency(value: number, locale = 'id-ID', currency = 'IDR') {
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);

  return formatted.replace(/\s+/g, '');
}

export function formatDate(value: string | number | Date, options?: Intl.DateTimeFormatOptions) {
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  }).format(date);
}

export function formatPhone(value: string) {
  const digits = value.replace(/[^0-9]/g, '');

  if (!digits) {
    return '';
  }

  if (digits.startsWith('0')) {
    return `${PHONE_COUNTRY_CODE}${digits.slice(1)}`;
  }

  if (digits.startsWith('62')) {
    return `+${digits}`;
  }

  return `+${digits}`;
}

export function truncate(value: string, maxLength: number) {
  if (maxLength < 0) {
    return value;
  }

  if (value.length <= maxLength) {
    return value;
  }

  if (maxLength <= 3) {
    return value.slice(0, maxLength);
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

export function slugify(value: string) {
  return value
    .toString()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateQRData(recordType: string, recordId: string) {
  return JSON.stringify({
    type: recordType,
    id: recordId,
    source: QR_DATA_PREFIX,
    timestamp: new Date().toISOString()
  });
}
