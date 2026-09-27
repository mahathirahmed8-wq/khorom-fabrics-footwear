/**
 * KHOROM Social Media and Chat Link Helpers
 */

export function formatFacebookLink(url?: string): string {
  const val = (url || '').trim();
  if (!val) {
    return 'https://facebook.com/khoromstore';
  }
  if (val.startsWith('http://') || val.startsWith('https://')) {
    return val;
  }
  return `https://${val}`;
}

export function formatWhatsAppLink(urlOrNumber?: string, fallbackNumber: string = '01817629255'): string {
  const val = (urlOrNumber || '').trim();
  if (!val) {
    const cleanFallback = fallbackNumber.replace(/\D/g, '');
    const international = cleanFallback.startsWith('880')
      ? cleanFallback
      : cleanFallback.startsWith('0')
      ? '88' + cleanFallback
      : '880' + cleanFallback;
    return `https://wa.me/${international}`;
  }

  // If already a valid URL, return it directly
  if (val.startsWith('http://') || val.startsWith('https://')) {
    return val;
  }

  // Otherwise treat as a phone number
  const digits = val.replace(/\D/g, '');
  if (!digits) {
    return 'https://wa.me/8801817629255';
  }

  const international = digits.startsWith('880')
    ? digits
    : digits.startsWith('0')
    ? '88' + digits
    : digits.length === 10
    ? '880' + digits
    : digits;

  return `https://wa.me/${international}`;
}
