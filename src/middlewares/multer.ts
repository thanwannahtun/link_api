

import multer from 'multer';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { log } from 'console';

// Get the directory name from the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = join(__dirname, '../uploads');

log(`__filename ::: ${__filename}`);
log(`__dirname ::: ${__dirname}`);
log(`uploadDir ::: ${uploadDir}`)
log('------------------------------------------------------------------------------------');


// Ensure directories exist
const ensureDirectoryExists = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

ensureDirectoryExists(uploadDir);


const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, uploadDir);
    },
    filename(req, file, callback) {
        callback(null, Date.now() + path.extname(file.originalname))
    },
});

const fieldName = "files"; /// fieldName of the request's formData containg files field

const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 3 },
}).array(fieldName, 10);

export const uploadFormData = upload;