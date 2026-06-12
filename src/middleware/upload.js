

import multer  from 'multer';
import path    from 'path';
import fs      from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── Upload folder ────────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ─── Multer: save to disk ─────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext    = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext     = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('Only JPEG / PNG / WEBP images are allowed'), false);
};

export const upload = multer({
  storage,
  limits:     { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

// ─── Helper: convert file to public URL ──────────────────────────────────────
// بدل Cloudinary، بنرجع URL محلي
export const uploadToCloudinary = async (buffer, folder) => {
  // الدالة دي مش بتتاستخدم مع disk storage
  // بس خليناها عشان الكود القديم متكسرش
  throw new Error('Use req.file / req.files directly with disk storage');
};

// ─── Helper: get public URL from filename ────────────────────────────────────
export const getFileUrl = (filename) => {
  const BASE = process.env.BASE_URL || 'http://localhost:5000';
  return `${BASE}/uploads/${filename}`;
};
