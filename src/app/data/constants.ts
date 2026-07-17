// ─── Color Constants ─────────────────────────────────────────────────────────
export const BLUE = "#2563EB";
export const GREEN = "#16A34A";
export const AMBER = "#D97706";
export const RED = "#DC2626";
export const PURPLE = "#7C3AED";
export const SLATE = "#64748B";

// ─── Theme Helpers ───────────────────────────────────────────────────────────
export interface ThemeProps {
  dark: boolean;
  bg: string;
  inputBg: string;
  cardBg: string;
  textMain: string;
  textMuted: string;
  borderColor: string;
  cardShadow: string;
}

export function getTheme(dark: boolean): ThemeProps {
  return {
    dark,
    bg: "transparent",
    inputBg: dark ? "rgba(15,23,42,0.7)" : "rgba(248,250,252,0.9)",
    cardBg: dark ? "#1E293B" : "#FFFFFF",
    textMain: dark ? "#F1F5F9" : "#0F172A",
    textMuted: dark ? "#94A3B8" : "#64748B",
    borderColor: dark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)",
    cardShadow: dark
      ? "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)"
      : "0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.06)",
  };
}

// ─── Nav Links ───────────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: "Dashboard", sectionId: "stats" },
  { label: "Menu Makanan", path: "/menus" },
  { label: "Lacak SPPG", path: "/lacak" },
  { label: "AI Nutrition", path: "/ai" },
  { label: "Anggaran", path: "/budget" },
  { label: "Pengaduan", path: "/feedback" },
  { label: "Laporan", path: "/laporan" },
];

// ─── Chart / Stats Data ──────────────────────────────────────────────────────
export const pieData = [
  { name: "Protein", value: 28, color: BLUE },
  { name: "Sayuran", value: 22, color: GREEN },
  { name: "Buah", value: 15, color: "#F59E0B" },
  { name: "Susu", value: 18, color: PURPLE },
  { name: "Karbohidrat", value: 17, color: "#0EA5E9" },
];

export const barData = [
  { bulan: "Jan", anggaran: 4.2, realisasi: 3.9 },
  { bulan: "Feb", anggaran: 4.5, realisasi: 4.3 },
  { bulan: "Mar", anggaran: 4.8, realisasi: 4.6 },
  { bulan: "Apr", anggaran: 5.1, realisasi: 4.9 },
  { bulan: "Mei", anggaran: 5.3, realisasi: 5.1 },
  { bulan: "Jun", anggaran: 5.6, realisasi: 5.4 },
  { bulan: "Jul", anggaran: 5.9, realisasi: 5.7 },
];

export const lineData = [
  { bulan: "Jan", nilai: 85 },
  { bulan: "Feb", nilai: 87 },
  { bulan: "Mar", nilai: 89 },
  { bulan: "Apr", nilai: 88 },
  { bulan: "Mei", nilai: 91 },
  { bulan: "Jun", nilai: 93 },
  { bulan: "Jul", nilai: 96 },
];

export const trendData = [
  { hari: "Sen", distribusi: 88, target: 95 },
  { hari: "Sel", distribusi: 91, target: 95 },
  { hari: "Rab", distribusi: 87, target: 95 },
  { hari: "Kam", distribusi: 94, target: 95 },
  { hari: "Jum", distribusi: 96, target: 95 },
  { hari: "Sab", distribusi: 92, target: 95 },
  { hari: "Min", distribusi: 94, target: 95 },
];

export const tableData = [
  { sekolah: "SDN Menteng 01", menu: "Nasi + Ayam + Sayur", skor: 96, distribusi: "125 paket", status: "Selesai" as const, ai: "✓ Lulus" as const, waktu: "07:42 WIB" },
  { sekolah: "SDN Kebayoran 03", menu: "Nasi + Ikan + Buah", skor: 94, distribusi: "98 paket", status: "Selesai" as const, ai: "✓ Lulus" as const, waktu: "07:55 WIB" },
  { sekolah: "SDN Tebet 05", menu: "Nasi + Tempe + Susu", skor: 91, distribusi: "112 paket", status: "Dalam Proses" as const, ai: "✓ Lulus" as const, waktu: "08:10 WIB" },
  { sekolah: "SDN Cilandak 02", menu: "Nasi + Daging + Sayur", skor: 98, distribusi: "87 paket", status: "Selesai" as const, ai: "✓ Lulus" as const, waktu: "07:38 WIB" },
  { sekolah: "SDN Pasar Minggu 04", menu: "Nasi + Telur + Buah", skor: 88, distribusi: "103 paket", status: "Terlambat" as const, ai: "⚠ Periksa" as const, waktu: "08:32 WIB" },
  { sekolah: "SDN Mampang 01", menu: "Nasi + Ayam + Susu", skor: 95, distribusi: "91 paket", status: "Selesai" as const, ai: "✓ Lulus" as const, waktu: "07:51 WIB" },
  { sekolah: "SDN Pancoran 03", menu: "Nasi + Ikan + Sayur", skor: 93, distribusi: "78 paket", status: "Selesai" as const, ai: "✓ Lulus" as const, waktu: "08:02 WIB" },
  { sekolah: "SDN Jatinegara 02", menu: "Nasi + Daging + Buah", skor: 97, distribusi: "134 paket", status: "Selesai" as const, ai: "✓ Lulus" as const, waktu: "07:45 WIB" },
];

export const feedbackData = [
  {
    nama: "Ibu Sari Dewi", peran: "Orang Tua Siswa", rating: 5,
    komentar: "Makanan yang diberikan sangat bergizi dan anak saya sangat menyukainya. Porsi sudah sangat sesuai.",
    sekolah: "SDN Menteng 01",
    balasan: "Terima kasih atas apresiasi Anda. Kami terus berkomitmen menjaga kualitas gizi.",
    foto: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop&auto=format",
  },
  {
    nama: "Bpk. Rudi Hartono", peran: "Guru Kelas 4", rating: 4,
    komentar: "Program ini sangat membantu. Siswa terlihat lebih semangat belajar setelah makan siang bergizi.",
    sekolah: "SDN Kebayoran 03",
    balasan: "Terima kasih masukkannya. Kami akan terus meningkatkan program ini.",
    foto: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=120&h=120&fit=crop&auto=format",
  },
  {
    nama: "Komite Sekolah", peran: "SDN Cilandak 02", rating: 5,
    komentar: "Transparansi anggaran dan kualitas menu sangat memuaskan. Harap dipertahankan.",
    sekolah: "SDN Cilandak 02",
    balasan: "Apresiasi setinggi-tingginya. Transparansi adalah prioritas utama kami.",
    foto: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=120&h=120&fit=crop&auto=format",
  },
];

export const sppgLocations = [
  { nama: "SPPG IPOCOB2V", kota: "KOTA BANDUNG", paket: 3500, status: "Belum Beroperasi", lat: -6.9175, lng: 107.6191 },
  { nama: "SPPG XOQ7N3UQ", kota: "KAB. SUKOHARJO", paket: 2800, status: "Belum Beroperasi", lat: -7.6833, lng: 110.8333 },
  { nama: "SPPG BJLZRAWN", kota: "KAB. BANTUL", paket: 4200, status: "Belum Beroperasi", lat: -7.8863, lng: 110.3283 },
  { nama: "SPPG GDEDQP4M", kota: "KAB. BOGOR", paket: 5100, status: "Belum Beroperasi", lat: -6.5971, lng: 106.7932 },
  { nama: "SPPG XQZCDXHX", kota: "KAB. MAROS", paket: 2100, status: "Belum Beroperasi", lat: -5.0039, lng: 119.5714 },
  { nama: "SPPG EY9TI1BT", kota: "KAB. PAMEKASAN", paket: 1900, status: "Belum Beroperasi", lat: -7.1565, lng: 113.4815 },
  { nama: "SPPG QNOMOEVV", kota: "KOTA PALANGKARAYA", paket: 2500, status: "Belum Beroperasi", lat: -2.2083, lng: 113.9167 },
  { nama: "SPPG JOXNNMSN", kota: "KAB. PRINGSEWU", paket: 1750, status: "Belum Beroperasi", lat: -5.3582, lng: 104.9757 },
  { nama: "SPPG PWA2ECX3", kota: "KOTA TANGERANG SEL.", paket: 4800, status: "Beroperasi", lat: -6.2886, lng: 106.7179 },
  { nama: "SPPG VRWN87XE", kota: "KAB. SUMBAWA", paket: 1500, status: "Belum Beroperasi", lat: -8.5000, lng: 117.4167 },
  { nama: "SPPG WMQ1CVMU", kota: "KOTA MAKASSAR", paket: 6200, status: "Belum Beroperasi", lat: -5.1477, lng: 119.4327 },
  { nama: "SPPG ZBTPPTP9", kota: "KOTA BATAM", paket: 5500, status: "Belum Beroperasi", lat: 1.0828, lng: 104.0305 },
  { nama: "SPPG IDY3KLOF", kota: "KAB. BELITUNG TIMUR", paket: 1200, status: "Beroperasi", lat: -2.8550, lng: 108.1568 },
  { nama: "SPPG 0TR18JCY", kota: "KOTA DEPOK", paket: 4500, status: "Belum Beroperasi", lat: -6.4025, lng: 106.7942 },
  { nama: "SPPG MFDP5QLD", kota: "KOTA PADANG", paket: 3800, status: "Belum Beroperasi", lat: -0.9471, lng: 100.3831 },
  { nama: "SPPG WKZFPITZ", kota: "KAB. MUSI BANYUASIN", paket: 2300, status: "Belum Beroperasi", lat: -2.8833, lng: 103.8000 },
  { nama: "SPPG WTOWKGLO", kota: "KAB. SLEMAN", paket: 3100, status: "Belum Beroperasi", lat: -7.7156, lng: 110.3556 },
  { nama: "SPPG AHHENWN4", kota: "KOTA SEMARANG", paket: 5900, status: "Belum Beroperasi", lat: -6.9932, lng: 110.4203 },
  { nama: "SPPG E6R1WMEV", kota: "KAB. LOMBOK TIMUR", paket: 2900, status: "Belum Beroperasi", lat: -8.6500, lng: 116.5333 },
  { nama: "SPPG 9GQQ0TQZ", kota: "KOTA SUBULUSSALAM", paket: 1100, status: "Belum Beroperasi", lat: 2.6333, lng: 97.9333 },
  { nama: "SPPG LGDVULFR", kota: "KAB. JENEPONTO", paket: 1800, status: "Beroperasi", lat: -5.6833, lng: 119.7000 },
  { nama: "SPPG KKHTJORS", kota: "KOTA MEDAN", paket: 8500, status: "Belum Beroperasi", lat: 3.5952, lng: 98.6722 },
  { nama: "SPPG JIS9GLXU", kota: "KAB. TIMOR TENGAH UTARA", paket: 1400, status: "Beroperasi", lat: -9.4500, lng: 124.4833 },
  { nama: "SPPG BUGFZEQB", kota: "KOTA SURABAYA", paket: 7200, status: "Belum Beroperasi", lat: -7.2504, lng: 112.7688 },
  { nama: "SPPG V38OQIHK", kota: "KOTA TARAKAN", paket: 1600, status: "Belum Beroperasi", lat: 3.3000, lng: 117.6333 },
];

export interface NotificationItem {
  id: string;
  tipe: "critical" | "warning" | "success" | "info";
  pesan: string;
  waktu: string;
  aksi: string;
  path: string;
  isRead: boolean;
}

export const initialNotifications: NotificationItem[] = [];

export const analyticsData = [
  { label: "Distribusi Hari Ini", value: 94.2, color: BLUE, unit: "%" },
  { label: "Pemenuhan Gizi", value: 96, color: GREEN, unit: "%" },
  { label: "Akurasi AI Deteksi", value: 96.8, color: PURPLE, unit: "%" },
  { label: "Penggunaan Anggaran", value: 87.3, color: AMBER, unit: "%" },
  { label: "Cakupan Sekolah", value: 98.1, color: "#0EA5E9", unit: "%" },
];
