import fs from 'fs-extra';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

const messagesFile = path.join(process.cwd(), 'data', 'messages.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { sender, text } = req.body;

    if (!sender || !text) {
      return res.status(400).json({ error: 'Missing sender or text' });
    }

    const newMessage = {
      id: Date.now(),
      sender,
      text,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    const messages = await fs.readJSON(messagesFile).catch(() => []);
    messages.push(newMessage);
    await fs.writeJSON(messagesFile, messages, { spaces: 2 });

    return res.status(200).json({ success: true, message: newMessage });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
