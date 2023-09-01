import { Schema as MongooseSchema } from 'mongoose';

interface TokenPayload {
  id: MongooseSchema.Types.ObjectId;
}

export default TokenPayload;
