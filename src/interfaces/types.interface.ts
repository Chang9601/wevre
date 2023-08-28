import { Schema as MongooseSchema } from 'mongoose';

import { Bid } from '../entities/bid.entity';
import { Item } from '../entities/item.entity';

export interface IBid {
  id: MongooseSchema.Types.ObjectId;
  price: number;
  name: string;
  email: string;
}

export interface IBids {
  bids: Bid[];
  total: number;
}

export interface IItems {
  items: Item[];
  total: number;
}
