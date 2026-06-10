import { describe, expect, it } from 'vitest';
import { cn, formatCurrency, formatDate, formatPhone, truncate, generateQRData } from './utils';

describe('lib/utils', () => {
  describe('cn', () => {
    it('should merge and deduplicate class names', () => {
      expect(cn('btn', 'btn-primary', 'btn')).toBe('btn btn-primary');
    });

    it('should handle falsy values gracefully', () => {
      expect(cn('text-sm', false, undefined, 'font-medium')).toBe('text-sm font-medium');
    });
  });

  describe('formatCurrency', () => {
    it('should format number as Indonesian rupiah', () => {
      expect(formatCurrency(150000)).toBe('Rp150.000');
    });

    it('should format zero as currency', () => {
      expect(formatCurrency(0)).toBe('Rp0');
    });
  });

  describe('formatDate', () => {
    it('should format ISO date string in id-ID locale', () => {
      expect(formatDate('2025-12-05T09:15:00.000Z')).toContain('5');
      expect(formatDate('2025-12-05T09:15:00.000Z')).toContain('2025');
    });

    it('should return original string for invalid date', () => {
      expect(formatDate('invalid-date')).toBe('invalid-date');
    });
  });

  describe('formatPhone', () => {
    it('should convert local Indonesian number to international format', () => {
      expect(formatPhone('081234567890')).toBe('+6281234567890');
    });

    it('should preserve international format when already prefixed with 62', () => {
      expect(formatPhone('6281234567890')).toBe('+6281234567890');
    });

    it('should return empty string for non-numeric input', () => {
      expect(formatPhone('abc')).toBe('');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings and append ellipsis', () => {
      expect(truncate('This string is too long', 10)).toBe('This st...');
    });

    it('should not change shorter strings', () => {
      expect(truncate('short', 10)).toBe('short');
    });

    it('should handle negative maxLength by returning original string', () => {
      expect(truncate('value', -1)).toBe('value');
    });
  });

  describe('generateQRData', () => {
    it('should return valid JSON string with record metadata', () => {
      const result = generateQRData('pet', 'abc123');
      const parsed = JSON.parse(result);

      expect(parsed).toEqual({
        type: 'pet',
        id: 'abc123',
        source: 'petcare-suite',
        timestamp: expect.any(String)
      });
    });
  });
});
