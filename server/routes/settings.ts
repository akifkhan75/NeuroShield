
import {Router, Request, Response} from 'express';
import { db } from '../db';
import { UserSettings } from '../../types';

const router = Router();

// NOTE: These routes are NOT protected by authentication for simplicity.
// In a real app, middleware would verify the user's session/token.

router.get('/', (req: Request, res: Response) => {
    const settings = db.getSettings();
    if (settings) {
        res.json(settings);
    } else {
        res.status(404).json({ message: 'Settings not found' });
    }
});

router.put('/', (req: any, res: any) => {
    const newSettings: UserSettings = req.body;
    if (!newSettings) {
        return res.status(400).json({ message: 'Settings data is required.' });
    }

    const updatedSettings = db.updateSettings(newSettings);
    if (updatedSettings) {
        res.json(updatedSettings);
    } else {
        res.status(404).json({ message: 'User not found, could not update settings.' });
    }
});

export default router;