// auth-backend/pages/api/register.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { registerUser } from '../../lib/users';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  const success = registerUser(email, password);

  if (!success) {
    return res.status(409).json({ message: 'Utilisateur déjà existant' });
  }

  return res.status(201).json({ message: 'Utilisateur créé avec succès' });
}
