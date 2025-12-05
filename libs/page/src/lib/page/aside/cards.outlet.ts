import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { CardsData, PageRecordInterface } from '@o2k/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { CardComponent, IconDirective, VibrateDirective } from '@o2k/ui';
import dayjs from 'dayjs';

@Component({
  selector: 'page-cards-outlet',
  imports: [VibrateDirective, IconDirective, CardComponent],
  templateUrl: './cards.outlet.html',
  styleUrl: './cards.outlet.scss',
})
export class CardsOutlet {
  @ViewChild('deckScroller') deckScroller?: ElementRef<HTMLElement>;

  currentIndex = signal<number>(0);

  private readonly route = inject(ActivatedRoute);
  protected readonly resolvedCards = toSignal<PageRecordInterface[]>(
    this.route.data.pipe(map((data: CardsData) => data['cards'] ?? [])),
    { requireSync: true }
  );
  protected readonly dayjs = dayjs;

  private get cardWidth(): number {
    const scroller = this.deckScroller?.nativeElement;
    if (!scroller) {
      return 0;
    }
    const firstCard = scroller.querySelector<HTMLElement>('.deck-card');
    if (firstCard && firstCard.offsetWidth > 0) {
      const style = getComputedStyle(firstCard);
      const marginRight = parseFloat(style.marginRight || '0');
      return firstCard.offsetWidth + marginRight;
    }
    return scroller.clientWidth;
  }

  scrollByCard(direction: -1 | 1): void {
    const cards = this.resolvedCards();
    if (!cards.length) {
      return;
    }
    const scroller = this.deckScroller?.nativeElement;
    if (!scroller) {
      return;
    }

    const total = cards.length;
    const nextIndex = (this.currentIndex() + direction + total) % total;
    const width = this.cardWidth;
    if (!width) {
      return;
    }
    const targetLeft = nextIndex * width;
    scroller.scrollTo({ left: targetLeft, behavior: 'smooth' });
    this.currentIndex.set(nextIndex);
  }

  onUserScroll(): void {
    const cards = this.resolvedCards();
    const scroller = this.deckScroller?.nativeElement;
    if (!scroller || !cards.length) {
      return;
    }
    const width = this.cardWidth;
    if (!width) {
      return;
    }
    const index = Math.round(scroller.scrollLeft / width);
    this.currentIndex.set(Math.max(0, Math.min(cards.length - 1, index)));
  }
}
