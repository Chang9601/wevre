import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

// 파이프는 요청이 경로 핸들러로 전달되기 전에 요청 객체를 변환하거나 검사한다.
// 파이프의 주요 목적은 입력 데이터를 원하는 형식으로 변환하거나 입력 데이터가 유효하지 않은 경우 예외를 처리하는 것이다.
@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: string, _: ArgumentMetadata) {
    if (!this.validateObjectId(value)) {
      throw new NotFoundException('존재하지 않는 아이디.');
    }

    return value;
  }

  private validateObjectId = (id: string) => {
    return Types.ObjectId.isValid(id);
  };
}
