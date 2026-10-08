import multer from "multer";

// Store uploaded files in memory so we can pass the buffer to Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({ storage });
