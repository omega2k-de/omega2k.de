import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NavItemInterface, PageRecordTree } from '../interfaces';
import { CONFIG } from '../tokens';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly config = inject(CONFIG);

  loadByLocation(location: 'header' | 'thought-pool'): Observable<NavItemInterface[]> {
    return this.http.get<NavItemInterface[]>(
      `${this.config.api}/navigation/${encodeURIComponent(location)}`
    );
  }

  tree(): Observable<PageRecordTree> {
    return this.http.get<PageRecordTree>(`${this.config.api}/tree`);
  }
}
