export interface LandingContent {
  // Hero
  hero_tag: string;
  hero_judul: string;
  hero_highlight: string;
  hero_deskripsi: string;
  hero_slide1_image: string;
  hero_slide1_badge: string;
  hero_slide1_sub: string;
  hero_slide2_image: string;
  hero_slide2_badge: string;
  hero_slide2_sub: string;
  hero_slide3_image: string;
  hero_slide3_badge: string;
  hero_slide3_sub: string;
  hero_slide4_image: string;
  hero_slide4_badge: string;
  hero_slide4_sub: string;

  // Tentang
  tentang_tag: string;
  tentang_judul: string;
  tentang_p1: string;
  tentang_p2: string;
  tentang_foto: string;

  // Produk Unggulan
  unggulan_tag: string;
  unggulan_judul: string;
  unggulan_deskripsi: string;

  // Galeri
  galeri_tag: string;
  galeri_judul: string;
  galeri_deskripsi: string;
  galeri_item1_img: string;
  galeri_item1_label: string;
  galeri_item1_tag: string;
  galeri_item2_img: string;
  galeri_item2_label: string;
  galeri_item2_tag: string;
  galeri_item3_img: string;
  galeri_item3_label: string;
  galeri_item3_tag: string;
  galeri_item4_img: string;
  galeri_item4_label: string;
  galeri_item4_tag: string;
  galeri_item5_img: string;
  galeri_item5_label: string;
  galeri_item5_tag: string;
  galeri_item6_img: string;
  galeri_item6_label: string;
  galeri_item6_tag: string;

  // Dynamic Galeri JSON (Bisa nambah tak terbatas)
  galeri_items_json?: string;

  // Banner Header Katalog
  katalog_banner_bg: string;
  katalog_tag: string;
  katalog_judul: string;
  katalog_deskripsi: string;

  // Kontak & Maps
  kontak_tag: string;
  kontak_judul: string;
  kontak_deskripsi: string;
  kontak_alamat: string;
  kontak_jam: string;
  kontak_wa: string;
  kontak_instagram: string;
  kontak_maps_embed: string;
  kontak_maps_url: string;
}

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  // Hero
  hero_tag: 'Rangkaian Buket Handmade Eksklusif',
  hero_judul: 'Buket Cantik untuk',
  hero_highlight: 'Setiap Momen',
  hero_deskripsi: 'Pilihan bunga segar, snack lezat, hingga buket uang unik. Dirangkai dengan detail penuh estetika dan siap dikirim via WhatsApp hanya dalam beberapa klik.',
  hero_slide1_image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=900&q=85',
  hero_slide1_badge: '100% Bunga & Bahan Segar',
  hero_slide1_sub: 'Rangkaian pastel mawar & aster',
  hero_slide2_image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=900&q=85',
  hero_slide2_badge: 'Koleksi Romantis & Anniversary',
  hero_slide2_sub: 'Sentuhan elegan peony import',
  hero_slide3_image: 'https://images.unsplash.com/photo-1523693916903-027d144a2806?w=900&q=85',
  hero_slide3_badge: 'Spesial Momen Wisuda',
  hero_slide3_sub: 'Lengkap boneka toga & kartu ucapan',
  hero_slide4_image: 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?w=900&q=85',
  hero_slide4_badge: 'Buket Snack & Hadiah Manis',
  hero_slide4_sub: 'Kombinasi Ferrero & cokelat favorit',

  // Tentang
  tentang_tag: 'Cerita Kami',
  tentang_judul: 'Merangkai Kebahagiaan dalam Setiap Buket',
  tentang_p1: 'Kami percaya setiap buket memiliki makna dan cerita tersendiri. Berawal dari kecintaan terhadap keindahan seni merangkai, kami hadir untuk membantu Anda mengungkapkan perasaan terbaik bagi orang tersayang.',
  tentang_p2: 'Dengan bahan pilihan berkualitas tinggi serta dedikasi penuh ketelitian, setiap rangkaian bunga, snack, uang, maupun boneka kami siapkan spesial untuk Anda.',
  tentang_foto: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&q=80',

  // Produk Unggulan
  unggulan_tag: 'Pilihan Favorit',
  unggulan_judul: 'Produk Unggulan',
  unggulan_deskripsi: 'Buket paling diminati yang dirancang khusus untuk mewakili ungkapan hati Anda.',

  // Galeri
  galeri_tag: 'Portfolio',
  galeri_judul: 'Karya & Kreasi Kami',
  galeri_deskripsi: 'Setiap karya dirangkai dengan presisi tangan terampil untuk momen tak terlupakan.',
  galeri_item1_img: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=700&q=85',
  galeri_item1_label: 'Buket Bunga Premium',
  galeri_item1_tag: 'Bestseller',
  galeri_item2_img: 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?w=500&q=80',
  galeri_item2_label: 'Buket Snack Favorit',
  galeri_item2_tag: 'Gift Idea',
  galeri_item3_img: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=500&q=80',
  galeri_item3_label: 'Buket Uang Kreatif',
  galeri_item3_tag: 'Custom',
  galeri_item4_img: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=500&q=80',
  galeri_item4_label: 'Buket Boneka Lucu',
  galeri_item4_tag: 'Spesial',
  galeri_item5_img: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=500&q=80',
  galeri_item5_label: 'Buket Mawar Merah',
  galeri_item5_tag: 'Romantis',
  galeri_item6_img: 'https://images.unsplash.com/photo-1523693916903-027d144a2806?w=500&q=80',
  galeri_item6_label: 'Buket Wisuda',
  galeri_item6_tag: 'Graduation',

  // Banner Header Katalog
  katalog_banner_bg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=85',
  katalog_tag: 'Koleksi Rangkaian',
  katalog_judul: 'Katalog Toko Buket',
  katalog_deskripsi: 'Buket bunga segar, snack, uang, dan kado wisuda custom pilihan terbaik untuk hari spesial Anda.',

  // Kontak & Maps
  kontak_tag: 'Ada Pertanyaan?',
  kontak_judul: 'Hubungi & Kunjungi Kami',
  kontak_deskripsi: 'Konsultasi buket impian atau ambil langsung pesanan Anda di galeri kami.',
  kontak_alamat: 'Jl. Pemuda No. 45, Menteng, Jakarta Pusat, DKI Jakarta 10310',
  kontak_jam: 'Senin – Sabtu: 09:00 – 18:00 WIB',
  kontak_wa: '081234567890',
  kontak_instagram: '@toko.buket',
  kontak_maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126920.28299863486!2d106.759478!3d-6.2293867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e800000001%3A0x6b402804b4d6!2sJakarta!5e0!3m2!1sid!2sid!4v1700000000000',
  kontak_maps_url: 'https://maps.google.com/?q=Jakarta',
};
