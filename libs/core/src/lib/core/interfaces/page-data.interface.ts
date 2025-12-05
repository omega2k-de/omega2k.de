import { Data } from '@angular/router';
import { PageRecordInterface } from './api.interface';

export interface PageData extends Data {
  page?: PageRecordInterface;
}
