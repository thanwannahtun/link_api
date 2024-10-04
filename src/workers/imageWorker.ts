
import sharp from 'sharp';
import fs from "fs";
import { parentPort, workerData } from 'worker_threads';

interface WorkerData {
    inputFilePath: string;
    outputFilePath: string;
}

const { inputFilePath, outputFilePath } = workerData as WorkerData;

// Validate file path
if (!fs.existsSync(workerData.inputFilePath)) {
    parentPort?.postMessage({ error: `File not found: ${workerData.inputFilePath}` });
    process.exit(1);
}

sharp(inputFilePath)
    .resize({ width: 800 }) // Example resizing, you can adjust this
    .toFile(outputFilePath, (err, info) => {
        if (err) {
            parentPort?.postMessage({ error: err.message });
        } else {
            parentPort?.postMessage({ success: info });
        }
    });
