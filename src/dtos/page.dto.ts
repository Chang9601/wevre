import { PageStateDto } from './page-state.dto';

export class PageDto<T> {
  state: PageStateDto;

  data: T[];

  constructor(state: PageStateDto, data: T[]) {
    this.state = state;
    this.data = data;
  }
}
