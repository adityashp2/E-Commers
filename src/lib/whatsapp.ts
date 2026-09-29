import { CartItem, CheckoutData } from '@/types';
import { formatRupiah, formatTanggal } from './utils';

export function buildWhatsAppMessage(data: CheckoutData): string {
  const itemLines = data.items
    .map((item, i) => {
      const subtotal = item.produk.harga * item.jumlah;
      return `${i + 1}. ${item.produk.nama} x${item.jumlah} — ${formatRupiah(subtotal)}`;
    })
    .join('\n');

  const total = data.items.reduce(
    (sum, item) => sum + item.produk.harga * item.jumlah,
    0
  );

  let message = `Halo Kak, saya mau pesan:\n\n`;
  message += `Nama: ${data.nama}\n`;
  message += `Tanggal Pengambilan: ${formatTanggal(data.tanggal)}\n\n`;
  message += `*DETAIL PESANAN*\n`;
  message += `${itemLines}\n\n`;
  message += `*TOTAL: ${formatRupiah(total)}*\n`;

  if (data.catatan.trim()) {
    message += `\nCatatan: ${data.catatan}\n`;
  }

  message += `\nMohon kirimkan QRIS untuk pembayaran ya 🙏`;

  return message;
}

export function getWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const formattedNumber = cleanNumber.startsWith('0')
    ? '62' + cleanNumber.slice(1)
    : cleanNumber;
  return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
}
