import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs-extra';
import path from 'path';

export const config = {
  api: {
    bodyParser: false
  }
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
const messagesFile = path.join(process.cwd(), 'data', 'messages.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await fs.ensureDir(uploadDir);

  const form = formidable({ uploadDir, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload failed' });

    const audio = files.audio?.[0];
    const sender = fields.sender?.[0];

    if (!audio || !sender) return res.status(400).json({ error: 'Missing audio or sender' });

    const audioPath = path.basename(audio.filepath);

    const newMessage = {
      id: Date.now(),
      sender,
      audio: `/uploads/${audioPath}`,
      timestamp: new Date().toISOString(),
      type: 'audio'
    };

    const messages = await fs.readJSON(messagesFile).catch(() => []);
    messages.push(newMessage);
    await fs.writeJSON(messagesFile, messages, { spaces: 2 });

    res.status(200).json({ success: true, message: newMessage });
  });
}
