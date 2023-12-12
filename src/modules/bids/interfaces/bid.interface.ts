import { Schema as MongooseSchema } from 'mongoose';

export interface Bid {
  id?: MongooseSchema.Types.ObjectId;
  price: number;
  name?: string;
  email?: string;
}
