import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Désactiver le parsing automatique de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const form = new IncomingForm();
  const uploadDir = path.join(process.cwd(), '/public/uploads');

  form.uploadDir = uploadDir;
  form.keepExtensions = true;

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors du traitement du fichier audio' });
    }

    const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;

    if (!file || !file.filepath) {
      return res.status(400).json({ message: 'Fichier audio manquant ou invalide' });
    }

    const audioId = uuidv4();
    const newFilename = `${audioId}.mp3`;
    const newPath = path.join(uploadDir, newFilename);

    fs.renameSync(file.filepath, newPath);

    const audioUrl = `/uploads/${newFilename}`;
    const createdAt = new Date().toISOString();

    res.status(201).json({
      message: 'Fichier audio reçu avec succès',
      data: {
        id: audioId,
        audioUrl,
        createdAt,
        type: 'audio',
      },
    });
  });
};

export default handler;
