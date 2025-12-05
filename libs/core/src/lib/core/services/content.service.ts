import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CONFIG } from '../tokens';
import { PageRecordInterface } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly config = inject(CONFIG);

  loadByRoute(routePath: string): Observable<PageRecordInterface> {
    return this.http.get<PageRecordInterface>(`${this.config.api}${routePath}`);
  }
}
