import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CONFIG } from '../tokens';
import { catchError, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CookieEntry {
  key: string;
  value: string;
}

@Injectable({
  providedIn: 'root',
})
export class PrivacyService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly config = inject(CONFIG);

  cookies(): Observable<CookieEntry[]> {
    return this.privacy().pipe(map(response => response.cookies));
  }

  privacy(): Observable<{ cookies: CookieEntry[] }> {
    return this.http
      .get<{ cookies: CookieEntry[] }>(`${this.config.api}/privacy`, { withCredentials: true })
      .pipe(catchError(() => of({ cookies: [] })));
  }
}
