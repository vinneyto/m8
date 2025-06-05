import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class TextPipe implements PipeTransform {
  transform(value: unknown) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new BadRequestException('Invalid text');
    }
    return value;
  }
}
