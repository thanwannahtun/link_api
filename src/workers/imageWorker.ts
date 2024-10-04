
import sharp from 'sharp';
import { parentPort, workerData } from 'worker_threads';

interface WorkerData {
    inputFilePath: string;
    outputFilePath: string;
}

const { inputFilePath, outputFilePath } = workerData as WorkerData;

sharp(inputFilePath)
    .resize({ width: 800 }) // Example resizing, you can adjust this
    .toFile(outputFilePath, (err, info) => {
        if (err) {
            parentPort?.postMessage({ error: err.message });
        } else {
            parentPort?.postMessage({ success: info });
        }
    });
