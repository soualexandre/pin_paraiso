import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '../lib/database';
import { Street } from '../types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = getDatabase();
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const statement = db.prepare(`
      SELECT * FROM streets 
      WHERE name LIKE ? 
      LIMIT 10
    `);
    
    const streets = statement.all(`%${q}%`) as Street[];
    res.status(200).json(streets);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}