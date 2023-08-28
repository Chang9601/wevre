import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: string, _: ArgumentMetadata) {
    if (!this.validateObjectId(value)) {
      throw new BadRequestException('유효하지 않은 아이디.');
    }

    return value;
  }

  private validateObjectId = (id: string) => {
    return Types.ObjectId.isValid(id);
  };
}
