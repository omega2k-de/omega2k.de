import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CONFIG } from '../tokens';
import { Observable } from 'rxjs';
import { PageRecordInterface } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class CardsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly config = inject(CONFIG);

  loadAll(): Observable<PageRecordInterface[]> {
    return this.http.get<PageRecordInterface[]>(`${this.config.api}/cards`);
  }

  loadBySlug(slug: string): Observable<PageRecordInterface[]> {
    return this.http.get<PageRecordInterface[]>(`${this.config.api}/cards/${slug}`);
  }

  loadRandom(number: number): Observable<PageRecordInterface[]> {
    return this.http.get<PageRecordInterface[]>(`${this.config.api}/random-cards/${number}`);
  }
}
