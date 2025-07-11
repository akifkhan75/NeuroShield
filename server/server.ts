
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import settingsRoutes from './routes/settings';
import dangerZoneRoutes from './routes/dangerZones';
import aiRoutes from './routes/ai';

dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes. This will allow your React app
// (running on a different port) to communicate with this server.
app.use(cors());

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/danger-zones', dangerZoneRoutes);
app.use('/api/ai', aiRoutes);

// A simple root route to check if the server is up
app.get('/', (req: express.Request, res: express.Response) => {
    res.send('Backend server is running!');
});

app.listen(3001, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});