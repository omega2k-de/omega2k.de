import { Data } from '@angular/router';
import { PageRecordInterface } from './api.interface';

export interface CardsData extends Data {
  cards?: PageRecordInterface[];
}
