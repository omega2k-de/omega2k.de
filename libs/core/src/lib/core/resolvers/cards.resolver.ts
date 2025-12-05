import { inject } from '@angular/core';
import { CardsService } from '../services';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { PageRecordInterface } from '../interfaces';

export const cardsResolver: ResolveFn<PageRecordInterface[]> = (route: ActivatedRouteSnapshot) => {
  const cards = inject(CardsService);
  const slug = route.paramMap.get('topic') ?? route.paramMap.get('slug') ?? 'random';
  return cards.loadBySlug(slug).pipe(catchError(() => of([])));
};

export const featuredCardsResolver: (amount: number) => ResolveFn<PageRecordInterface[]> =
  amount => () =>
    inject(CardsService)
      .loadRandom(amount)
      .pipe(catchError(() => of([])));

export const allCardsResolver: ResolveFn<PageRecordInterface[]> = () =>
  inject(CardsService)
    .loadAll()
    .pipe(catchError(() => of([])));
