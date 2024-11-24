import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import routes from './routes/index.js';
import path from 'path';

import dotenv from "dotenv";
dotenv.config();

import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name from the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Serve the 'uploads' directory as static files
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Routes
app.use('/api', routes);

// const mongoURI = process.env.DATABASE_ATLAS_URL as string;
// const mongoURI = process.env.DATABASE_URL as string;
const mongoURI = `${process.env.DATABASE_ATLAS_URL}`;


mongoose.connect(mongoURI, {})
    .then(() => console.log(`MongoDB connected ${mongoURI}`))
    .catch((e) => console.log("Error Connecting MongoDB", e));

export default app;
