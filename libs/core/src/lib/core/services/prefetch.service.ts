import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, delay, Observable } from 'rxjs';
import { ContentService } from './content.service';
import { CardsService } from './cards.service';
import { LikesService } from './likes.service';

@Injectable({
  providedIn: 'root',
})
export class PrefetchService {
  private readonly content = inject(ContentService);
  private readonly cards = inject(CardsService);
  private readonly likes = inject(LikesService);
  private readonly queue: Observable<unknown>[] = [];
  private readonly tick = new BehaviorSubject<number>(0);
  private readonly tick$ = this.tick.asObservable();

  prefetchAll() {
    if (this.queue.length === 0) {
      this.cards.loadAll().subscribe(cards => {
        for (const card of cards) {
          this.queue.push(this.content.loadByRoute(card.route));
          this.queue.push(this.cards.loadBySlug(card.slug));
          this.queue.push(this.likes.getState(card.id));
        }
        this.process(this.queue.length);
      });
    }
    return this.tick$;
  }

  private dequeue() {
    return this.queue.shift();
  }

  private process(length: number) {
    this.tick.next(length !== 0 ? 1 - this.queue.length / length : 0);
    this.dequeue()
      ?.pipe(delay(16))
      .subscribe(() => this.process(length));
  }
}
