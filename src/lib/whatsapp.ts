import { CartItem, CheckoutData } from '@/types';
import { formatRupiah, formatTanggal } from './utils';

export function buildWhatsAppMessage(data: CheckoutData): string {
  const hasPo = data.items.some((item) => item.produk.status === 'po');

  const itemLines = data.items
    .map((item, i) => {
      const subtotal = item.produk.harga * item.jumlah;
      const isPo = item.produk.status === 'po';
      const poTag = isPo ? ' [PRE-ORDER H-7]' : '';
      let line = `${i + 1}. *${item.produk.nama}${poTag}*\n`;
      line += `   - Jumlah: ${item.jumlah} pcs\n`;
      line += `   - Subtotal: ${formatRupiah(subtotal)}`;
      // Only include photo URL if it is a valid web URL (exclude heavy base64 data URLs)
      if (
        item.produk.foto_url &&
        (item.produk.foto_url.startsWith('http://') ||
          item.produk.foto_url.startsWith('https://')) &&
        !item.produk.foto_url.startsWith('data:')
      ) {
        line += `\n   - Link Foto: ${item.produk.foto_url}`;
      }
      return line;
    })
    .join('\n\n--------------------\n\n');

  const total = data.items.reduce(
    (sum, item) => sum + item.produk.harga * item.jumlah,
    0
  );

  let message = `Halo Kak, saya ingin memesan buket:\n\n`;
  message += `*DATA PEMESAN*\n`;
  message += `Nama: ${data.nama}\n`;
  if (hasPo) {
    message += `Jenis Pesanan: *PRE-ORDER (Minimal H-7)*\n`;
  }
  message += `Tanggal Pengambilan: ${formatTanggal(data.tanggal)}\n\n`;
  message += `*DETAIL PRODUK:*\n\n`;
  message += `${itemLines}\n\n`;
  message += `====================\n`;
  message += `*TOTAL PEMBAYARAN: ${formatRupiah(total)}*\n`;
  message += `====================\n`;

  if (data.catatan && data.catatan.trim()) {
    message += `\n*Catatan Khusus:*\n${data.catatan}\n`;
  }

  message += `\nMohon konfirmasi pesanan dan kirimkan info QRIS pembayaran ya Kak. Terima kasih!`;

  return message;
}

export function getWhatsAppUrl(phoneNumber: string, message: string): string {
  const fallbackNumber = '6285161204930';
  let cleanNumber = (phoneNumber || '').replace(/\D/g, '');

  if (!cleanNumber) {
    cleanNumber = fallbackNumber;
  } else if (cleanNumber.startsWith('0')) {
    cleanNumber = '62' + cleanNumber.slice(1);
  } else if (!cleanNumber.startsWith('62')) {
    cleanNumber = '62' + cleanNumber;
  }

  return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`;
}
