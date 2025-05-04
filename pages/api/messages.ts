// pages/api/messages.ts
import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

const filePath = path.join(process.cwd(), 'data', 'messages.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { text, type } = req.body;

      if (!text || !type) {
        return res.status(400).json({ message: 'Champs requis manquants' });
      }

      const rawData = fs.readFileSync(filePath, 'utf-8');
      const messages = JSON.parse(rawData);

      const newMessage = {
        id: uuidv4(),
        text,
        createdAt: new Date().toISOString(),
        type,
      };

      messages.push(newMessage);
      fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf-8');

      return res.status(201).json({
        message: 'Message envoyé avec succès',
        data: newMessage,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur', error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
}
