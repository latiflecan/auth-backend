import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

const filePath = path.join(process.cwd(), 'data', 'messages.json');

type ChatMessage = {
  id: string;
  text?: string;
  audioUrl?: string;
  createdAt: string;
  type: 'text' | 'audio';
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const messages = JSON.parse(fileData);
    return res.status(200).json({ messages });
  }

  if (req.method === 'POST') {
    const { text, type } = req.body;
    if (!text || !type) {
      return res.status(400).json({ message: 'Champs manquants.' });
    }

    const fileData = fs.readFileSync(filePath, 'utf-8');
    const messages = JSON.parse(fileData);

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      createdAt: new Date().toISOString(),
      type,
    };

    messages.push(newMessage);
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf-8');

    return res.status(201).json({ message: 'Message envoyé avec succès', data: newMessage });
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
}
