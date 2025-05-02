// auth-backend/pages/api/login.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { loginUser } from '../../lib/users';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Champs manquants' });
  }

  const isValid = loginUser(email, password);

  if (!isValid) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  return res.status(200).json({ message: 'Connexion réussie' });
}
