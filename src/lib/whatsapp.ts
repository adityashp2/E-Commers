import { CartItem, CheckoutData } from '@/types';
import { formatRupiah, formatTanggal } from './utils';

export function buildWhatsAppMessage(data: CheckoutData): string {
  const itemLines = data.items
    .map((item, i) => {
      const subtotal = item.produk.harga * item.jumlah;
      let line = `${i + 1}. *${item.produk.nama}*\n`;
      line += `   - Jumlah: ${item.jumlah} pcs\n`;
      line += `   - Subtotal: ${formatRupiah(subtotal)}`;
      if (item.produk.foto_url) {
        line += `\n   - Foto Produk: ${item.produk.foto_url}`;
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
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const formattedNumber = cleanNumber.startsWith('0')
    ? '62' + cleanNumber.slice(1)
    : cleanNumber;
  return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
}
