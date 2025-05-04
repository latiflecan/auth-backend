// 📄 fichier : pages/api/messages/audio.ts

import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';

// Désactiver le parsing automatique de Next.js pour gérer les fichiers
export const config = {
  api: {
    bodyParser: false,
  },
};

// Type message
type Message = {
  id: string;
  text?: string;
  audioUrl?: string;
  createdAt: string;
  type: 'audio' | 'text';
};

// Chemins
const messagesPath = path.join(process.cwd(), 'data', 'messages.json');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

// Lire les messages
function readMessages(): Message[] {
  try {
    const data = fs.readFileSync(messagesPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Écrire les messages
function writeMessages(messages: Message[]) {
  fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2), 'utf-8');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  // Créer le dossier /public/uploads s’il n’existe pas
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const form = new formidable.IncomingForm({
    uploadDir: uploadsDir,
    keepExtensions: true,
    multiples: false,
  });

  form.parse(req, (err, fields, files) => {
    if (err || !files.audio) {
      return res.status(400).json({ message: 'Fichier audio manquant ou invalide' });
    }

    const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;
    const fileName = uuidv4() + '.m4a';
    const filePath = path.join(uploadsDir, fileName);

    fs.renameSync(file.filepath, filePath);

    const audioUrl = `/uploads/${fileName}`;
    const messages = readMessages();

    const newMessage: Message = {
      id: uuidv4(),
      audioUrl,
      createdAt: new Date().toISOString(),
      type: 'audio',
    };

    messages.push(newMessage);
    writeMessages(messages);

    return res.status(201).json({ message: 'Audio enregistré', data: newMessage });
  });
}
