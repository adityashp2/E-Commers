export interface Ulasan {
  id: string;
  nama: string;
  rating: number; // 1 - 5
  komentar: string;
  tanggal: string;
  buket_terpilih?: string;
  is_approved?: boolean;
}

export const MOCK_ULASAN: Ulasan[] = [
  {
    id: 'rev-1',
    nama: 'Nabila Azzahra',
    rating: 5,
    komentar: 'Buket wisudanya cantik bangett! Bunganya fresh, wrapping-nya rapi pol dan selempang namanya presisi. Kakak adminnya super ramah & fast respon.',
    tanggal: '2 hari yang lalu',
    buket_terpilih: 'Buket Wisuda Elegant Rose & Teddy',
    is_approved: true,
  },
  {
    id: 'rev-2',
    nama: 'Dimas Prasetyo',
    rating: 5,
    komentar: 'Pesan buat anniversary dadakan H-1, alhamdulillah pengerjaan on time dan hasilnya mewah banget. Pacar saya suka banget sama mawar pastelnya!',
    tanggal: '5 hari yang lalu',
    buket_terpilih: 'Buket Anniversary Pastel Peony Romance',
    is_approved: true,
  },
  {
    id: 'rev-3',
    nama: 'Clarissa Maharani',
    rating: 5,
    komentar: 'Buket snack-nya lucu & kokoh, cokelatnya nggak ada yang leleh. Kartu ucapannya dicetak rapi font estetik. Pasti bakal repeat order di sini!',
    tanggal: '1 minggu yang lalu',
    buket_terpilih: 'Buket Snack Cokelat Ferrero & Pocky',
    is_approved: true,
  },
  {
    id: 'rev-4',
    nama: 'Rizky Fadillah',
    rating: 5,
    komentar: 'Rekomendasi buket terbaik! Uang dirangkai aman tanpa rusak sedikitpun, pita dan hiasannya premium. Worth every penny.',
    tanggal: '2 minggu yang lalu',
    buket_terpilih: 'Buket Uang Kipas Aesthetic',
    is_approved: true,
  },
];
