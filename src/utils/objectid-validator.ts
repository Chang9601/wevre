import { BadRequestException } from '@nestjs/common';
import { Schema as MongooseSchema, Types } from 'mongoose';

export const objectIdValidator = (id: MongooseSchema.Types.ObjectId) => {
  if (!Types.ObjectId.isValid(id.toString())) {
    throw new BadRequestException('Invalid ObjectId.');
  }
};
