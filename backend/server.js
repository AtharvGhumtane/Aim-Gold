import express from 'express';

import cors from  'cors';

import dotenv from 'dotenv';

import mongoose from 'mongoose';

import postsRoutes from './routes/posts.routes.js';

import userRoutes from './routes/user.routes.js';

import path from 'path';

import { fileURLToPath } from 'url';


import fs from 'fs';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(postsRoutes);
app.use(userRoutes);
app.use('/uploads', express.static(uploadsDir));


const start = async () => {
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/aim-gold";
    console.log(`Connecting to MongoDB: ${mongoURI}`);
    const connectDB = await mongoose.connect(mongoURI);

    app.listen(9000,() => {
        console.log("Server is running on port 9000")
    })
}

start(); 