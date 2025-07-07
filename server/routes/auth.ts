import express, { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

router.post('/login', (req: any, res: any) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = db.getUser(email);

    if (user && user.passwordHash === password) {
        return res.json({ 
            message: 'Login successful', 
            user: { fullName: user.settings.personalInfo.fullName } 
        });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
});

router.post('/signup', (req: any, res: any) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const newUser = db.createUser(email, password, name);

    if (newUser) {
        return res.status(201).json({ 
            message: 'Signup successful', 
            user: { fullName: newUser.settings.personalInfo.fullName } 
        });
    }
    
    return res.status(409).json({ message: 'User with this email already exists' });
});

export default router;