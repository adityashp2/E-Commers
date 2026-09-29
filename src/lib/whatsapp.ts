import { CartItem, CheckoutData } from '@/types';
import { formatRupiah, formatTanggal } from './utils';

export function buildWhatsAppMessage(data: CheckoutData): string {
  const itemLines = data.items
    .map((item, i) => {
      const subtotal = item.produk.harga * item.jumlah;
      let line = `${i + 1}. *${item.produk.nama}* (x${item.jumlah}) — ${formatRupiah(subtotal)}`;
      if (item.produk.foto_url) {
        line += `\n   Lihat Foto: ${item.produk.foto_url}`;
      }
      return line;
    })
    .join('\n\n');

  const total = data.items.reduce(
    (sum, item) => sum + item.produk.harga * item.jumlah,
    0
  );

  let message = `Halo Kak, saya mau pesan:\n\n`;
  message += `*Nama Pemesan:* ${data.nama}\n`;
  message += `*Tanggal Pengambilan:* ${formatTanggal(data.tanggal)}\n\n`;
  message += `*DETAIL PRODUK & PESANAN:*\n`;
  message += `${itemLines}\n\n`;
  message += `*TOTAL PEMBAYARAN: ${formatRupiah(total)}*\n`;

  if (data.catatan && data.catatan.trim()) {
    message += `*Catatan:* ${data.catatan}\n`;
  }

  message += `\nMohon konfirmasi pesanan dan kirimkan nomor rekening / QRIS pembayaran ya Kak. Terima kasih!`;

  return message;
}

export function getWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const formattedNumber = cleanNumber.startsWith('0')
    ? '62' + cleanNumber.slice(1)
    : cleanNumber;
  return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
}
