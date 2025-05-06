// pages/api/messages/audio.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Désactiver le body parser intégré de Next.js pour cette route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Définir les types de la réponse
type Data =
  | { message: string; audioUrl?: string }
  | { message: string };

// Gestionnaire de la requête POST
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const form = formidable({
    keepExtensions: true,
    uploadDir: path.join(process.cwd(), '/public/uploads'),
  });

  // Crée le dossier s'il n'existe pas
  if (!fs.existsSync(form.uploadDir)) {
    fs.mkdirSync(form.uploadDir, { recursive: true });
  }

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors du traitement du fichier audio' });
    }

    const audioFile = files.audio as File | File[] | undefined;

    if (!audioFile) {
      return res.status(400).json({ message: 'Aucun fichier audio fourni' });
    }

    const file = Array.isArray(audioFile) ? audioFile[0] : audioFile;
    const audioId = uuidv4();
    const audioUrl = `/uploads/${path.basename(file.filepath)}`;

    return res.status(201).json({
      message: 'Fichier audio reçu avec succès',
      audioUrl,
    });
  });
}
