import { Schema as MongooseSchema } from 'mongoose';

export interface TokenPayload {
  id: MongooseSchema.Types.ObjectId;
}
