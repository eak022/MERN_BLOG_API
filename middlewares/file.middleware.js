const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

// ตั้งค่า Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ตั้งค่า Storage ของ Multer ให้ใช้ Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mern_blog_images", // กำหนดโฟลเดอร์ใน Cloudinary
    allowed_formats: ["jpeg", "jpg", "png", "gif", "webp"], // ฟอร์แมตที่อนุญาต
    transformation: [{ quality: "auto" }], // ลดคุณภาพอัตโนมัติ (ปรับขนาดไฟล์)
  },
});

// สร้าง Middleware อัปโหลด
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // จำกัดขนาดไฟล์ 5 MB
}).single("file");

module.exports = { upload };
