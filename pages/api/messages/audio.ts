import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import formidable, { File } from 'formidable';
import { v4 as uuidv4 } from 'uuid';

// 🔒 Désactive le bodyParser de Next.js pour permettre à formidable de fonctionner
export const config = {
  api: {
    bodyParser: false,
  },
};

// 📁 Assure-toi que le dossier /public/uploads existe
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const form = formidable({ multiples: false, uploadDir: uploadsDir, keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err || !files.audio) {
      console.error('Erreur de parsing:', err);
      return res.status(500).json({ message: 'Erreur lors de l’envoi du fichier audio.' });
    }

    const audioFile = files.audio as File;
    const filename = `${uuidv4()}.m4a`;
    const newPath = path.join(uploadsDir, filename);

    fs.rename(audioFile.filepath, newPath, (renameErr) => {
      if (renameErr) {
        console.error('Erreur de renommage:', renameErr);
        return res.status(500).json({ message: 'Erreur de traitement du fichier.' });
      }

      const message = {
        id: uuidv4(),
        audioUrl: `/uploads/${filename}`,
        createdAt: new Date().toISOString(),
        type: 'audio',
      };

      // Stockage local temporaire
      const dbPath = path.join(process.cwd(), 'data', 'messages.json');
      const messages = fs.existsSync(dbPath)
        ? JSON.parse(fs.readFileSync(dbPath, 'utf8'))
        : [];

      messages.unshift(message);
      fs.writeFileSync(dbPath, JSON.stringify(messages, null, 2));

      res.status(201).json({ message: 'Audio envoyé avec succès', data: message });
    });
  });
}
