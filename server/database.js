import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pastikan folder data ada
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'sipmbg.db'), { verbose: console.log });

// Aktifkan Foreign Keys
db.pragma('foreign_keys = ON');

// Bikin tabel kalau belum ada
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      image TEXT,
      date TEXT NOT NULL,
      calories INTEGER NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fat REAL NOT NULL,
      vitamins TEXT,
      minerals TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS feedbacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      rating INTEGER NOT NULL,
      image TEXT,
      reply TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS nutrition_predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      image TEXT NOT NULL,
      food_name TEXT,
      confidence REAL,
      calories INTEGER,
      protein REAL,
      fat REAL,
      carbs REAL,
      vitamins TEXT,
      minerals TEXT,
      status TEXT,
      recommendation TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location TEXT NOT NULL,
      address TEXT NOT NULL,
      lat REAL,
      lng REAL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      packages INTEGER NOT NULL,
      vehicles_active INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Bikin admin default kalau tabel users kosong
  const stmt = db.prepare("SELECT COUNT(*) as count FROM users");
  const result = stmt.get();
  if (result.count === 0) {
    // Karena ini dummy, kita gak hash password dulu untuk simplisitas kecuali diminta
    // Tapi baiknya di-hash kalau sungguhan. Di sini kita biarin plain text 'admin123' 
    // karena fokus pada SQLite dan koneksi.
    const insertAdmin = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
    insertAdmin.run("Administrator", "admin@kemdikbud.go.id", "admin123", "admin");
    
    const insertUser = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
    insertUser.run("Siswa Demo", "siswa@sekolah.id", "siswa123", "user");
    console.log("Default admin & user created.");
  }

  // Seed default schedules if schedules table is empty
  const scheduleCountStmt = db.prepare("SELECT COUNT(*) as count FROM schedules");
  if (scheduleCountStmt.get().count === 0) {
    const defaultSchedules = [
      { location: "SPPG IPOCOB2V", address: "KOTA BANDUNG", packages: 3500, status: "Belum Beroperasi", lat: -6.9175, lng: 107.6191, date: "2026-07-16" },
      { location: "SPPG XOQ7N3UQ", address: "KAB. SUKOHARJO", packages: 2800, status: "Belum Beroperasi", lat: -7.6833, lng: 110.8333, date: "2026-07-16" },
      { location: "SPPG BJLZRAWN", address: "KAB. BANTUL", packages: 4200, status: "Belum Beroperasi", lat: -7.8863, lng: 110.3283, date: "2026-07-16" },
      { location: "SPPG GDEDQP4M", address: "KAB. BOGOR", packages: 5100, status: "Belum Beroperasi", lat: -6.5971, lng: 106.7932, date: "2026-07-16" },
      { location: "SPPG XQZCDXHX", address: "KAB. MAROS", packages: 2100, status: "Belum Beroperasi", lat: -5.0039, lng: 119.5714, date: "2026-07-16" },
      { location: "SPPG EY9TI1BT", address: "KAB. PAMEKASAN", packages: 1900, status: "Belum Beroperasi", lat: -7.1565, lng: 113.4815, date: "2026-07-16" },
      { location: "SPPG QNOMOEVV", address: "KOTA PALANGKARAYA", packages: 2500, status: "Belum Beroperasi", lat: -2.2083, lng: 113.9167, date: "2026-07-16" },
      { location: "SPPG JOXNNMSN", address: "KAB. PRINGSEWU", packages: 1750, status: "Belum Beroperasi", lat: -5.3582, lng: 104.9757, date: "2026-07-16" },
      { location: "SPPG PWA2ECX3", address: "KOTA TANGERANG SEL.", packages: 4800, status: "Beroperasi", lat: -6.2886, lng: 106.7179, date: "2026-07-16" },
      { location: "SPPG VRWN87XE", address: "KAB. SUMBAWA", packages: 1500, status: "Belum Beroperasi", lat: -8.5000, lng: 117.4167, date: "2026-07-16" },
      { location: "SPPG WMQ1CVMU", address: "KOTA MAKASSAR", packages: 6200, status: "Belum Beroperasi", lat: -5.1477, lng: 119.4327, date: "2026-07-16" },
      { location: "SPPG ZBTPPTP9", address: "KOTA BATAM", packages: 5500, status: "Belum Beroperasi", lat: 1.0828, lng: 104.0305, date: "2026-07-16" },
      { location: "SPPG IDY3KLOF", address: "KAB. BELITUNG TIMUR", packages: 1200, status: "Beroperasi", lat: -2.8550, lng: 108.1568, date: "2026-07-16" },
      { location: "SPPG 0TR18JCY", address: "KOTA DEPOK", packages: 4500, status: "Belum Beroperasi", lat: -6.4025, lng: 106.7942, date: "2026-07-16" },
      { location: "SPPG MFDP5QLD", address: "KOTA PADANG", packages: 3800, status: "Belum Beroperasi", lat: -0.9471, lng: 100.3831, date: "2026-07-16" },
      { location: "SPPG WKZFPITZ", address: "KAB. MUSI BANYUASIN", packages: 2300, status: "Belum Beroperasi", lat: -2.8833, lng: 103.8000, date: "2026-07-16" },
      { location: "SPPG WTOWKGLO", address: "KAB. SLEMAN", packages: 3100, status: "Belum Beroperasi", lat: -7.7156, lng: 110.3556, date: "2026-07-16" },
      { location: "SPPG AHHENWN4", address: "KOTA SEMARANG", packages: 5900, status: "Belum Beroperasi", lat: -6.9932, lng: 110.4203, date: "2026-07-16" },
      { location: "SPPG E6R1WMEV", address: "KAB. LOMBOK TIMUR", packages: 2900, status: "Belum Beroperasi", lat: -8.6500, lng: 116.5333, date: "2026-07-16" },
      { location: "SPPG 9GQQ0TQZ", address: "KOTA SUBULUSSALAM", packages: 1100, status: "Belum Beroperasi", lat: 2.6333, lng: 97.9333, date: "2026-07-16" },
      { location: "SPPG LGDVULFR", address: "KAB. JENEPONTO", packages: 1800, status: "Beroperasi", lat: -5.6833, lng: 119.7000, date: "2026-07-16" },
    ];

    const insertSchedule = db.prepare(`
      INSERT INTO schedules (location, address, lat, lng, date, status, packages, vehicles_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const s of defaultSchedules) {
      insertSchedule.run(s.location, s.address, s.lat, s.lng, s.date, s.status, s.packages, 2);
    }
    console.log("Default schedules seeded.");
  }

  // Seed default menus if menus table is empty
  const menuCountStmt = db.prepare("SELECT COUNT(*) as count FROM menus");
  const today = new Date().toISOString().split('T')[0];
  if (menuCountStmt.get().count === 0) {
    const defaultMenus = [
      { name: "Nasi Ayam Sayur Segar", category: "Makan Siang", date: today, calories: 520, protein: 32, carbs: 65, fat: 12, vitamins: "A, C, D", minerals: "Fe, Ca, Zn", description: "Menu seimbang dengan nasi putih, ayam panggang rendah lemak, dan tumis sayuran segar kaya vitamin." },
      { name: "Nasi Ikan Gurame Bakar", category: "Makan Siang", date: today, calories: 480, protein: 35, carbs: 58, fat: 10, vitamins: "B12, D, E", minerals: "Omega-3, Ca, P", description: "Ikan gurame bakar kaya Omega-3 dengan nasi dan lalapan segar, mendukung perkembangan otak anak." },
      { name: "Bubur Ayam Sehat", category: "Sarapan", date: today, calories: 320, protein: 18, carbs: 42, fat: 7, vitamins: "B1, B6, A", minerals: "Fe, Zn", description: "Bubur ayam bergizi dengan topping telur rebus dan sayur, cocok sebagai sarapan anak sekolah." },
      { name: "Roti Gandum + Susu Sapi", category: "Sarapan", date: today, calories: 280, protein: 14, carbs: 45, fat: 6, vitamins: "D, B12, C", minerals: "Ca, K", description: "Kombinasi roti gandum utuh dengan segelas susu sapi murni untuk sarapan bergizi optimal." },
      { name: "Nasi Tempe Orek + Buah", category: "Makan Siang", date: today, calories: 440, protein: 22, carbs: 62, fat: 9, vitamins: "B2, C, K", minerals: "Fe, Mg, Ca", description: "Tempe orek kaya protein nabati disajikan dengan nasi dan potongan buah segar sebagai penutup." },
      { name: "Sup Sayur + Daging Sapi", category: "Makan Malam", date: today, calories: 390, protein: 28, carbs: 35, fat: 11, vitamins: "A, C, B6", minerals: "Fe, Zn, P", description: "Sup hangat bergizi dengan daging sapi, wortel, kentang, dan berbagai sayuran dalam kaldu bening." },
      { name: "Pisang + Susu Cokelat", category: "Snack", date: today, calories: 210, protein: 8, carbs: 38, fat: 4, vitamins: "B6, C, D", minerals: "K, Ca, Mg", description: "Snack sehat untuk istirahat sekolah – pisang matang segar dengan segelas susu cokelat rendah gula." },
      { name: "Nasi Telur Dadar Bayam", category: "Makan Malam", date: today, calories: 410, protein: 20, carbs: 55, fat: 10, vitamins: "A, E, K", minerals: "Fe, Ca, Mg", description: "Telur dadar bayam kaya zat besi dan vitamin disajikan dengan nasi putih hangat." },
      { name: "Nasi Goreng Spesial", category: "Makan Siang", date: today, calories: 420, protein: 22, carbs: 58, fat: 13, vitamins: "B1, B6, E", minerals: "Na, Fe, Zn", description: "Nasi goreng dengan ayam suwir, telur, dan sayuran pilihan. Bumbu rempah khas yang lezat dan bergizi tinggi." },
      { name: "Sup Jagung Ayam", category: "Makan Malam", date: today, calories: 350, protein: 24, carbs: 38, fat: 9, vitamins: "A, C, B6", minerals: "K, Fe, Ca", description: "Sup hangat jagung manis dengan potongan ayam empuk. Kaya serat dan vitamin untuk kesehatan optimal." },
      { name: "Jus Alpukat Susu", category: "Snack", date: today, calories: 220, protein: 5, carbs: 20, fat: 14, vitamins: "E, B5, K", minerals: "K, Mg, Ca", description: "Minuman sehat kaya lemak baik dari alpukat dengan susu segar. Tinggi vitamin E untuk kesehatan kulit." },
      { name: "Omelet Sayur Keju", category: "Sarapan", date: today, calories: 310, protein: 20, carbs: 12, fat: 18, vitamins: "A, D, B12, B2", minerals: "Ca, P, Zn, Se", description: "Telur dadar isi sayuran segar dan keju cheddar. Tinggi protein untuk energi dan pertumbuhan anak." },
      { name: "Ayam Bakar Madu", category: "Makan Siang", date: today, calories: 510, protein: 38, carbs: 28, fat: 18, vitamins: "B3, B6, D, E", minerals: "P, Zn, Se, Fe", description: "Ayam bakar dengan marinasi madu dan rempah pilihan. Tinggi protein, rendah lemak jenuh, sangat ideal untuk menu MBG." },
    ];
    const insertMenu = db.prepare(`
      INSERT INTO menus (name, category, date, calories, protein, carbs, fat, vitamins, minerals, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const m of defaultMenus) {
      insertMenu.run(m.name, m.category, m.date, m.calories, m.protein, m.carbs, m.fat, m.vitamins, m.minerals, m.description);
    }
    console.log("Default menus seeded.");
  } else {
    // Auto-update semua tanggal menu ke hari ini agar selalu tampil
    db.prepare("UPDATE menus SET date = ? WHERE date != ?").run(today, today);
  }

  // Seed default feedbacks if feedbacks table is empty
  const feedbackCountStmt = db.prepare("SELECT COUNT(*) as count FROM feedbacks");
  if (feedbackCountStmt.get().count === 0) {
    const adminUser = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
    const regularUser = db.prepare("SELECT id FROM users WHERE role = 'user'").get();

    const defaultFeedbacks = [
      { user_id: regularUser?.id || null, message: "Makanan yang diberikan sangat bergizi dan anak saya sangat menyukainya. Porsi sudah sangat sesuai untuk anak usia sekolah dasar.", type: "Apresiasi", rating: 5, reply: "Terima kasih atas apresiasi Anda. Kami terus berkomitmen menjaga kualitas gizi untuk generasi penerus bangsa." },
      { user_id: null, message: "Program ini sangat membantu. Siswa terlihat lebih semangat belajar setelah makan siang bergizi. Harap dipertahankan dan ditingkatkan.", type: "Saran", rating: 4, reply: "Terima kasih masukannya. Semangat belajar anak adalah prioritas utama kami." },
      { user_id: null, message: "Variasi menu perlu ditambah agar anak tidak bosan. Minggu ini sama saja menunya. Mohon perhatian dari pihak terkait.", type: "Kritik", rating: 3, reply: "Terima kasih kritikannya. Kami akan segera meningkatkan variasi menu setiap minggunya." },
      { user_id: null, message: "Transparansi anggaran dan kualitas menu sangat memuaskan. Harap dipertahankan dan jadikan ini sebagai standar nasional.", type: "Apresiasi", rating: 5, reply: "Apresiasi setinggi-tingginya. Transparansi adalah prioritas utama kami." },
    ];
    const insertFeedback = db.prepare(`
      INSERT INTO feedbacks (user_id, message, type, rating, reply)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const f of defaultFeedbacks) {
      insertFeedback.run(f.user_id, f.message, f.type, f.rating, f.reply);
    }
    console.log("Default feedbacks seeded.");
  }
}

export default db;
