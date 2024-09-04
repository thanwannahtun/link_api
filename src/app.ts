import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import routes from './routes/index.js';

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/link_myanmar';
mongoose.connect(mongoURI, {})
    .then(() => console.log('MongoDB connected'))
    .catch(() => console.log("Error Connecting MongoDB"));

export default app;
