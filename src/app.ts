import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import routes from './routes/index.js';
import path from 'path';

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

// MongoDB connection
// const mongoURI = "mongodb+srv://thanwanna:449206487!@?mongodbatlas@linkmyanmar.0fvzb.mongodb.net/linkMyanmarDB?retryWrites=true&w=majority&appName=linkMyanmar";
// const mongoURI = "mongodb+srv://linkMyanmarPassword:linkMyanmarPassword@linkmyanmar.0fvzb.mongodb.net/linkMyanmarDB?retryWrites=true&w=majority&appName=linkMyanmar";

const mongoURI = 'mongodb://localhost:27017/link_myanmar';
mongoose.connect(mongoURI, {})
    .then(() => console.log('MongoDB connected'))
    .catch((e) => console.log("Error Connecting MongoDB", e));


export default app;
