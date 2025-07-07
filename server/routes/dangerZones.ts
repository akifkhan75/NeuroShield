
import {Router, Request, Response} from 'express';
import { db } from '../db';
import { DangerZoneSeverity, DangerZoneType } from '../../types';

const router = Router();

// NOTE: These routes are NOT protected by authentication for simplicity.

router.get('/', (req: Request, res: Response) => {
    const zones = db.getDangerZones();
    res.json(zones);
});

router.post('/', (req: any, res: any) => {
    const { type, severity, description } = req.body as { type: DangerZoneType; severity: DangerZoneSeverity; description: string; };

    if (!type || !severity || !description) {
        return res.status(400).json({ message: 'Type, severity, and description are required.' });
    }

    const newZone = db.addDangerZone({ type, severity, description });
    res.status(201).json(newZone);
});

export default router;