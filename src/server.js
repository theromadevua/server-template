import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import sequelize from './config/database.js';
import authRoutes from './routes/auth.js';

dotenv.config();
const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        
        await sequelize.sync({ force: false });;
        
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT} `);
        });
    } catch (error) {
        console.error('Error: ', error);
    }
};

startServer();