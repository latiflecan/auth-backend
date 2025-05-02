import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json({
      messages: [
        { id: '1', text: 'Bienvenue dans TiflowApp!', createdAt: new Date(), type: 'text' },
      ],
    });
  } else {
    res.status(405).json({ message: 'Méthode non autorisée' });
  }
}
