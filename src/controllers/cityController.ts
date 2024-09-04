
import { Request, Response } from 'express';
import { City } from '../models/model.js';

export const getCities = async (req: Request, res: Response) => {
  try {
    const cities = await City.find();
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error });
  }
};