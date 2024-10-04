import multer from 'multer';
import fs from 'fs';
import path from 'path';

/* +++++++++++++++++++ */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name from the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadDir = join(__dirname, '../uploads');
const compressedDir = join(__dirname, '../uploads/compressed');

// Ensure directories exist
const ensureDirectoryExists = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

ensureDirectoryExists(uploadDir);
ensureDirectoryExists(compressedDir);


/* +++++++++++++++++++ */

// Setup multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Use the absolute path stored in `uploadDir`
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware to handle file uploads
export const uploadPostImages = upload.array('files'); // Adjust 'files' and limit as needed


