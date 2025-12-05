import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { LikeState } from '../interfaces';
import { CONFIG } from '../tokens';

@Injectable({ providedIn: 'root' })
export class LikesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly config = inject(CONFIG);
  private readonly baseUrl = '/likes';

  getState(articleId: number): Observable<LikeState> {
    return this.http
      .get<LikeState>(`${this.config.api}${this.baseUrl}/${articleId}`, {
        withCredentials: true,
      })
      .pipe(catchError(() => of({ articleId })));
  }

  getAllStates(): Observable<LikeState[]> {
    return this.http
      .get<LikeState[]>(`${this.config.api}${this.baseUrl}`, {
        withCredentials: true,
      })
      .pipe(catchError(() => of([])));
  }

  toggle(articleId: number): Observable<LikeState> {
    return this.http
      .post<LikeState>(
        `${this.config.api}${this.baseUrl}/${articleId}/toggle`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(catchError(() => of({ articleId })));
  }
}
