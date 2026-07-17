import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db, { initDB } from './database.js';
import multer from 'multer';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Inisialisasi Database
initDB();

// Setup Multer untuk upload gambar
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static(uploadDir));

// ==========================================
// ROUTES
// ==========================================

// 1. AUTH
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
  
  const stmt = db.prepare('SELECT id, name, email, role FROM users WHERE email = ? AND password = ?');
  const user = stmt.get(email, password);
  
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ error: "Email atau password salah." });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Semua field wajib diisi." });
  
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(400).json({ error: "Email sudah digunakan." });
  
  try {
    const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    const info = stmt.run(name, email, password, 'user');
    const newUser = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(info.lastInsertRowid);
    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Gagal mendaftar, coba lagi." });
  }
});

// 2. USERS
app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    const info = stmt.run(name, email, password, role || 'user');
    res.json({ id: info.lastInsertRowid, success: true });
  } catch (error) {
    res.status(400).json({ error: "Email mungkin sudah digunakan" });
  }
});

app.delete('/api/users/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ success: true });
});

app.put('/api/users/:id', (req, res) => {
  const { name, email, password, role } = req.body;
  const userId = req.params.id;
  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId);
    if (existing) return res.status(400).json({ error: 'Email sudah digunakan pengguna lain.' });
    if (password) {
      db.prepare('UPDATE users SET name=?, email=?, password=?, role=? WHERE id=?').run(name, email, password, role, userId);
    } else {
      db.prepare('UPDATE users SET name=?, email=?, role=? WHERE id=?').run(name, email, role, userId);
    }
    const updated = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(userId);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui pengguna' });
  }
});

app.put('/api/users/:id/profile', (req, res) => {
  const { name, email, password } = req.body;
  const userId = req.params.id;

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId);
    if (existing) return res.status(400).json({ error: "Email sudah digunakan oleh pengguna lain." });

    if (password) {
      const stmt = db.prepare('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?');
      stmt.run(name, email, password, userId);
    } else {
      const stmt = db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
      stmt.run(name, email, userId);
    }

    const updatedUser = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(userId);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui profil." });
  }
});

// 3. MENUS
app.get('/api/menus', (req, res) => {
  const menus = db.prepare('SELECT * FROM menus ORDER BY created_at DESC').all();
  res.json(menus);
});

app.post('/api/menus', upload.single('image'), (req, res) => {
  const { name, category, date, calories, protein, carbs, fat, vitamins, minerals, description } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  
  const stmt = db.prepare(`
    INSERT INTO menus (name, category, image, date, calories, protein, carbs, fat, vitamins, minerals, description) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const info = stmt.run(name, category, image, date, parseInt(calories)||0, parseFloat(protein)||0, parseFloat(carbs)||0, parseFloat(fat)||0, vitamins, minerals, description);
  res.json({ id: info.lastInsertRowid, success: true });
});

app.delete('/api/menus/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM menus WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ success: true });
});

app.put('/api/menus/:id', upload.single('image'), (req, res) => {
  const { name, category, date, calories, protein, carbs, fat, vitamins, minerals, description } = req.body;
  const menuId = req.params.id;

  try {
    const currentMenu = db.prepare('SELECT image FROM menus WHERE id = ?').get(menuId);
    if (!currentMenu) return res.status(404).json({ error: "Menu tidak ditemukan" });

    let image = currentMenu.image;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
      if (currentMenu.image) {
        const oldPath = path.join(__dirname, '../public', currentMenu.image);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (e) { console.error(e); }
        }
      }
    }

    const stmt = db.prepare(`
      UPDATE menus 
      SET name = ?, category = ?, image = ?, date = ?, calories = ?, protein = ?, carbs = ?, fat = ?, vitamins = ?, minerals = ?, description = ?
      WHERE id = ?
    `);
    
    stmt.run(name, category, image, date, parseInt(calories)||0, parseFloat(protein)||0, parseFloat(carbs)||0, parseFloat(fat)||0, vitamins, minerals, description, menuId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui menu." });
  }
});

// 3. FEEDBACKS
app.get('/api/feedbacks', (req, res) => {
  const feedbacks = db.prepare(`
    SELECT f.*, u.name as user_name 
    FROM feedbacks f 
    LEFT JOIN users u ON f.user_id = u.id 
    ORDER BY f.created_at DESC
  `).all();
  res.json(feedbacks);
});

app.post('/api/feedbacks', upload.single('image'), (req, res) => {
  const { user_id, message, type, rating } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  
  const stmt = db.prepare('INSERT INTO feedbacks (user_id, message, type, rating, image) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(user_id || null, message, type, parseInt(rating)||0, image);
  res.json({ id: info.lastInsertRowid, success: true });
});

app.patch('/api/feedbacks/:id/reply', (req, res) => {
  const { reply } = req.body;
  const stmt = db.prepare('UPDATE feedbacks SET reply = ? WHERE id = ?');
  stmt.run(reply, req.params.id);
  res.json({ success: true });
});

app.delete('/api/feedbacks/:id', (req, res) => {
  try {
    const record = db.prepare('SELECT image FROM feedbacks WHERE id = ?').get(req.params.id);
    if (!record) return res.status(404).json({ error: 'Feedback tidak ditemukan' });
    if (record.image) {
      const filePath = path.join(__dirname, '../public', record.image);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { console.error(e); }
      }
    }
    db.prepare('DELETE FROM feedbacks WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus feedback' });
  }
});

// 4. SCHEDULES
app.get('/api/schedules', (req, res) => {
  const schedules = db.prepare('SELECT * FROM schedules ORDER BY created_at DESC').all();
  res.json(schedules);
});

app.post('/api/schedules', (req, res) => {
  const { location, address, lat, lng, date, status, packages, vehicles_active } = req.body;
  const stmt = db.prepare(`
    INSERT INTO schedules (location, address, lat, lng, date, status, packages, vehicles_active) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(location, address, parseFloat(lat), parseFloat(lng), date, status, parseInt(packages)||0, parseInt(vehicles_active)||0);
  res.json({ id: info.lastInsertRowid, success: true });
});

app.delete('/api/schedules/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM schedules WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ success: true });
});

app.put('/api/schedules/:id', (req, res) => {
  const { location, address, lat, lng, date, status, packages, vehicles_active } = req.body;
  try {
    const existing = db.prepare('SELECT id FROM schedules WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Jadwal tidak ditemukan' });
    db.prepare(`UPDATE schedules SET location=?, address=?, lat=?, lng=?, date=?, status=?, packages=?, vehicles_active=? WHERE id=?`)
      .run(location, address, parseFloat(lat), parseFloat(lng), date, status, parseInt(packages)||0, parseInt(vehicles_active)||0, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui jadwal' });
  }
});

// ─── 5. AI NUTRITION PREDICTION ────────────────────────────────────────────
// Database 20 makanan Indonesia dengan data gizi realistis (TKPI)
const FOOD_DATABASE = [
  { food_name: "Nasi Goreng", calories: 250, protein: 6, carbs: 35, fat: 9, vitamins: "Vitamin B1, B2, B6, E", minerals: "Natrium, Fosfor, Kalium", status: "Sehat", confidence_base: 0.88, recommendation: "Nasi goreng mengandung kalori sedang. Kurangi minyak dan garam untuk versi lebih sehat. Tambahkan sayuran dan telur untuk gizi lebih lengkap." },
  { food_name: "Nasi Ayam Goreng", calories: 450, protein: 28, carbs: 55, fat: 12, vitamins: "Vitamin A, B1, B2, B6, C, D", minerals: "Zat Besi, Kalsium, Fosfor, Kalium, Zinc", status: "Sangat Sehat", confidence_base: 0.92, recommendation: "Kandungan gizi sangat seimbang! Protein cukup untuk pertumbuhan optimal, karbohidrat sebagai sumber energi. Sangat direkomendasikan untuk menu MBG." },
  { food_name: "Soto Ayam", calories: 180, protein: 15, carbs: 12, fat: 8, vitamins: "Vitamin A, B6, B12, C", minerals: "Kalsium, Fosfor, Zat Besi, Kalium", status: "Sangat Sehat", confidence_base: 0.90, recommendation: "Soto ayam kaya protein dan rendah kalori. Kuah bening mengandung kolagen alami. Sangat baik untuk pemulihan dan pertumbuhan anak." },
  { food_name: "Gado-gado", calories: 320, protein: 14, carbs: 28, fat: 18, vitamins: "Vitamin A, B1, B2, C, E, K", minerals: "Kalsium, Zat Besi, Fosfor, Magnesium, Zinc", status: "Sangat Sehat", confidence_base: 0.87, recommendation: "Gado-gado kaya serat dan vitamin dari sayuran segar. Saus kacang memberikan protein dan lemak baik. Salah satu makanan tradisional paling bergizi." },
  { food_name: "Rendang Sapi", calories: 520, protein: 35, carbs: 8, fat: 38, vitamins: "Vitamin B12, D, E, K", minerals: "Zat Besi, Zinc, Selenium, Fosfor", status: "Sehat", confidence_base: 0.91, recommendation: "Rendang tinggi protein hewani berkualitas tinggi. Kandungan lemak cukup tinggi, konsumsi dalam porsi wajar. Rempah-rempah mengandung antioksidan alami." },
  { food_name: "Mie Ayam", calories: 380, protein: 18, carbs: 52, fat: 12, vitamins: "Vitamin B1, B2, B6, B12", minerals: "Natrium, Fosfor, Kalium, Zat Besi", status: "Sehat", confidence_base: 0.89, recommendation: "Mie ayam sumber karbohidrat dan protein yang baik. Perhatikan kandungan natrium yang cukup tinggi. Tambahkan sayuran hijau untuk gizi lebih optimal." },
  { food_name: "Bakso Sapi", calories: 280, protein: 16, carbs: 30, fat: 10, vitamins: "Vitamin B12, B6, B2", minerals: "Zat Besi, Zinc, Fosfor, Natrium", status: "Sehat", confidence_base: 0.86, recommendation: "Bakso mengandung protein hewani yang cukup. Hindari tambahan MSG berlebih. Konsumsi dengan kuah bening dan sayuran untuk menu lebih seimbang." },
  { food_name: "Nasi Uduk", calories: 410, protein: 12, carbs: 65, fat: 14, vitamins: "Vitamin B1, B6, E", minerals: "Kalium, Magnesium, Fosfor, Natrium", status: "Sehat", confidence_base: 0.84, recommendation: "Nasi uduk dimasak dengan santan sehingga lebih gurih dan mengenyangkan. Lemak dari santan adalah MCT yang baik. Padu dengan lauk tinggi protein untuk seimbang." },
  { food_name: "Sate Ayam", calories: 290, protein: 24, carbs: 15, fat: 16, vitamins: "Vitamin B3, B6, B12, D", minerals: "Fosfor, Zinc, Selenium, Zat Besi", status: "Sangat Sehat", confidence_base: 0.93, recommendation: "Sate ayam protein tinggi dengan cara masak bakar (lebih sehat dari goreng). Saus kacang menambah lemak sehat. Ideal untuk menu bergizi tinggi." },
  { food_name: "Pecel Sayuran", calories: 270, protein: 10, carbs: 32, fat: 14, vitamins: "Vitamin A, B1, C, E, K", minerals: "Kalsium, Zat Besi, Magnesium, Mangan", status: "Sangat Sehat", confidence_base: 0.85, recommendation: "Pecel kaya serat dan vitamin dari aneka sayuran. Saus kacang mengandung protein nabati dan lemak tak jenuh. Sangat dianjurkan untuk diet seimbang." },
  { food_name: "Lontong Sayur", calories: 300, protein: 8, carbs: 48, fat: 10, vitamins: "Vitamin A, B1, C, K", minerals: "Kalsium, Kalium, Fosfor, Magnesium", status: "Sehat", confidence_base: 0.82, recommendation: "Lontong sayur kaya karbohidrat kompleks. Sayuran labu dan nangka kaya vitamin. Tambahkan protein seperti telur atau tahu untuk nutrisi lebih lengkap." },
  { food_name: "Tempe Goreng", calories: 240, protein: 16, carbs: 18, fat: 12, vitamins: "Vitamin B2, B3, B6, B12, K", minerals: "Kalsium, Zat Besi, Magnesium, Mangan, Fosfor", status: "Sangat Sehat", confidence_base: 0.94, recommendation: "Tempe adalah superfood Indonesia! Fermentasi meningkatkan bioavailabilitas nutrisi. Protein nabati lengkap, kaya probiotik untuk kesehatan usus." },
  { food_name: "Tahu Goreng", calories: 180, protein: 12, carbs: 8, fat: 12, vitamins: "Vitamin B1, B2, E, K", minerals: "Kalsium, Zat Besi, Magnesium, Fosfor, Zinc", status: "Sangat Sehat", confidence_base: 0.91, recommendation: "Tahu sumber protein nabati berkualitas dengan kalori rendah. Kaya kalsium untuk tulang kuat. Penggorengan dengan minyak terlalu banyak mengurangi manfaat kesehatannya." },
  { food_name: "Bubur Ayam", calories: 210, protein: 12, carbs: 28, fat: 7, vitamins: "Vitamin B1, B6, B12, D", minerals: "Natrium, Fosfor, Kalium, Zinc", status: "Sehat", confidence_base: 0.88, recommendation: "Bubur ayam mudah dicerna dan cocok untuk semua usia. Rendah lemak dan serat yang baik untuk lambung sensitif. Tambahkan cakwe dan kerupuk secukupnya." },
  { food_name: "Ketoprak", calories: 310, protein: 12, carbs: 42, fat: 12, vitamins: "Vitamin A, B1, C, E", minerals: "Kalsium, Zat Besi, Fosfor, Magnesium", status: "Sehat", confidence_base: 0.83, recommendation: "Ketoprak perpaduan tahu, bihun, dan sayuran yang bergizi. Saus kacang memberikan rasa dan protein. Pilih versi kurang manis untuk lebih sehat." },
  { food_name: "Rujak Buah", calories: 140, protein: 2, carbs: 32, fat: 3, vitamins: "Vitamin A, B6, C, E, K", minerals: "Kalium, Magnesium, Mangan, Tembaga", status: "Sangat Sehat", confidence_base: 0.87, recommendation: "Rujak buah kaya vitamin C dan antioksidan. Kandungan serat tinggi baik untuk pencernaan. Kurangi gula merah untuk versi lebih sehat. Sangat cocok untuk camilan bergizi." },
  { food_name: "Martabak Telur", calories: 480, protein: 20, carbs: 42, fat: 26, vitamins: "Vitamin A, B1, B2, B12, D", minerals: "Kalsium, Zat Besi, Fosfor, Natrium", status: "Kurang Sehat", confidence_base: 0.86, recommendation: "Martabak telur cukup tinggi kalori dan lemak karena digoreng. Konsumsi terbatas dan tidak terlalu sering. Pilih versi dengan lebih banyak sayuran di dalam." },
  { food_name: "Nasi Padang Lengkap", calories: 580, protein: 32, carbs: 68, fat: 22, vitamins: "Vitamin A, B6, B12, C, D, K", minerals: "Zat Besi, Zinc, Kalsium, Fosfor, Kalium", status: "Sehat", confidence_base: 0.90, recommendation: "Nasi padang lengkap dengan lauk beragam sangat kaya nutrisi. Porsi bisa disesuaikan kebutuhan. Rempah-rempah masakan Padang kaya antioksidan dan anti-inflamasi." },
  { food_name: "Cap Cay Sayuran", calories: 220, protein: 12, carbs: 18, fat: 12, vitamins: "Vitamin A, B1, B2, C, E, K", minerals: "Kalsium, Zat Besi, Kalium, Magnesium, Zinc", status: "Sangat Sehat", confidence_base: 0.89, recommendation: "Cap cay kaya vitamin dan mineral dari berbagai jenis sayuran. Protein dari ayam/udang melengkapi nilai gizi. Rendah kalori namun mengenyangkan — ideal untuk diet sehat." },
  { food_name: "Sayur Bayam Bening", calories: 80, protein: 4, carbs: 10, fat: 2, vitamins: "Vitamin A, B6, B9, C, E, K", minerals: "Zat Besi, Kalsium, Magnesium, Mangan, Kalium", status: "Sangat Sehat", confidence_base: 0.93, recommendation: "Sayur bayam adalah salah satu sayuran paling bergizi! Kaya zat besi untuk mencegah anemia. Vitamin K sangat tinggi untuk pembekuan darah dan kesehatan tulang." },
];

// Fungsi pseudo-random berdasarkan karakteristik file
function selectFood(fileSize, filename) {
  const seed = (fileSize % 20) + (filename.length % 20);
  const index = seed % FOOD_DATABASE.length;
  return FOOD_DATABASE[index];
}

// Variasi confidence agar terasa realistis
function calcConfidence(base, fileSize) {
  const variation = ((fileSize % 100) / 1000) - 0.05; // -0.05 sampai +0.05
  return Math.min(0.99, Math.max(0.70, base + variation));
}

app.post('/api/ai/predict', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Gambar wajib diunggah." });

  // Validasi tipe file
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(req.file.mimetype)) {
    return res.status(400).json({ error: "Format gambar tidak didukung. Gunakan JPEG, PNG, atau WebP." });
  }

  const imagePath = `/uploads/${req.file.filename}`;
  const userId = req.body.user_id || null;

  // Pilih makanan berdasarkan karakteristik file
  const food = selectFood(req.file.size, req.file.originalname);
  const confidence = calcConfidence(food.confidence_base, req.file.size);

  // Simulasi delay AI inference (1500-2500ms)
  const delay = 1500 + Math.floor(Math.random() * 1000);

  setTimeout(() => {
    try {
      const stmt = db.prepare(`
        INSERT INTO nutrition_predictions 
        (user_id, image, food_name, confidence, calories, protein, fat, carbs, vitamins, minerals, status, recommendation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const info = stmt.run(
        userId, imagePath, food.food_name, confidence,
        food.calories, food.protein, food.fat, food.carbs,
        food.vitamins, food.minerals, food.status, food.recommendation
      );

      res.json({
        id: info.lastInsertRowid,
        image: imagePath,
        food_name: food.food_name,
        confidence: Math.round(confidence * 100),
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        vitamins: food.vitamins,
        minerals: food.minerals,
        status: food.status,
        recommendation: food.recommendation,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Gagal menyimpan hasil analisis." });
    }
  }, delay);
});

app.get('/api/ai/history', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const records = db.prepare(`
      SELECT np.*, u.name as user_name
      FROM nutrition_predictions np
      LEFT JOIN users u ON np.user_id = u.id
      ORDER BY np.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM nutrition_predictions').get().count;

    res.json({ records, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: "Gagal memuat riwayat." });
  }
});

app.get('/api/ai/:id', (req, res) => {
  try {
    const record = db.prepare('SELECT * FROM nutrition_predictions WHERE id = ?').get(req.params.id);
    if (!record) return res.status(404).json({ error: "Data tidak ditemukan." });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: "Gagal memuat data." });
  }
});

app.delete('/api/ai/:id', (req, res) => {
  try {
    const record = db.prepare('SELECT image FROM nutrition_predictions WHERE id = ?').get(req.params.id);
    if (!record) return res.status(404).json({ error: "Data tidak ditemukan." });

    // Hapus file gambar dari disk
    if (record.image) {
      const filePath = path.join(__dirname, '../public', record.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    db.prepare('DELETE FROM nutrition_predictions WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus data." });
  }
});

// ─── 6. DASHBOARD STATS ──────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const totalMenus = db.prepare("SELECT COUNT(*) as count FROM menus").get().count;
  const totalFeedbacks = db.prepare("SELECT COUNT(*) as count FROM feedbacks").get().count;
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
  const totalAi = db.prepare("SELECT COUNT(*) as count FROM nutrition_predictions").get().count;
  
  res.json({ totalMenus, totalFeedbacks, totalUsers, totalAi });
});

// ─── 7. DYNAMIC NOTIFICATIONS ──────────────────────────────────────────────────
app.get('/api/notifications', (req, res) => {
  try {
    const notifications = [];
    let idCounter = 1;

    // Check Menus: Protein < 15g
    const lowProteinMenus = db.prepare("SELECT * FROM menus WHERE protein < 15").all();
    lowProteinMenus.forEach(menu => {
      notifications.push({
        id: `notif-${idCounter++}`,
        tipe: "warning",
        pesan: `Kandungan protein rendah (${menu.protein}g) pada menu: ${menu.name}`,
        waktu: "Baru saja",
        aksi: "Cek Menu",
        path: "/menus",
        isRead: false
      });
    });

    // Check Feedbacks: Rating < 4
    const lowRatingFeedbacks = db.prepare("SELECT * FROM feedbacks WHERE rating < 4").all();
    if (lowRatingFeedbacks.length > 0) {
      notifications.push({
        id: `notif-${idCounter++}`,
        tipe: "warning",
        pesan: `Terdapat ${lowRatingFeedbacks.length} keluhan dengan rating rendah yang belum terselesaikan.`,
        waktu: "Baru saja",
        aksi: "Tinjau Keluhan",
        path: "/feedback",
        isRead: false
      });
    }

    // Check Schedules: Status Terlambat
    const lateSchedules = db.prepare("SELECT * FROM schedules WHERE status = 'Terlambat'").all();
    if (lateSchedules.length > 0) {
      notifications.push({
        id: `notif-${idCounter++}`,
        tipe: "critical",
        pesan: `Distribusi terlambat di ${lateSchedules.length} lokasi SPPG.`,
        waktu: "Penting",
        aksi: "Lacak SPPG",
        path: "/lacak",
        isRead: false
      });
    }
    
    // Check AI Predictions: Low confidence or warning status
    const warningAI = db.prepare("SELECT * FROM nutrition_predictions WHERE status = 'warning' OR confidence < 80").all();
    if (warningAI.length > 0) {
      notifications.push({
        id: `notif-${idCounter++}`,
        tipe: "critical",
        pesan: `Sistem AI mendeteksi ${warningAI.length} anomali gizi pada porsi makan hari ini.`,
        waktu: "Penting",
        aksi: "Lihat Analisis",
        path: "/ai",
        isRead: false
      });
    }

    // If everything is perfectly fine, we might want to add a success notification just so it's not completely empty, but the user said "kalau nggak ada ya ngga usah" 
    // so we will just return what we have.

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal memuat notifikasi." });
  }
});

const server = app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use! Exiting.`);
    process.exit(1);
  } else {
    throw err;
  }
});