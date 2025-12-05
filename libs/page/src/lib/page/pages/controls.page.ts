import { AfterViewInit, Component, inject, signal } from '@angular/core';
import {
  CardsService,
  LikesService,
  LikeState,
  PageRecordInterface,
  ReadingProgressStorage,
} from '@o2k/core';
import { RouterLink } from '@angular/router';
import {
  IconDirective,
  LikeButtonComponent,
  ReadingProgressDirective,
  VibrateDirective,
} from '@o2k/ui';
import dayjs from 'dayjs';

@Component({
  selector: 'page-controls-page',
  imports: [
    RouterLink,
    ReadingProgressDirective,
    IconDirective,
    LikeButtonComponent,
    VibrateDirective,
  ],
  templateUrl: './controls.page.html',
  styleUrl: './controls.page.scss',
})
export class ControlsPage implements AfterViewInit {
  private readonly likesService = inject(LikesService);
  private readonly cardsService = inject(CardsService);
  private readonly progressStorage = inject(ReadingProgressStorage);
  protected likesMap = new Map<LikeState['articleId'], LikeState>();
  protected readonly cards = signal<PageRecordInterface[]>([]);
  protected readonly likes = signal<Map<LikeState['articleId'], LikeState>>(this.likesMap);
  protected readonly dayjs = dayjs;

  ngAfterViewInit() {
    this.cardsService.loadAll().subscribe(cards => this.cards.set(cards));
    this.likesService.getAllStates().subscribe(likes => {
      const data: [LikeState['articleId'], LikeState][] = likes.map((like: LikeState) => [
        like.articleId,
        like,
      ]);
      this.likesMap = new Map<LikeState['articleId'], LikeState>(data);
      this.likes.set(this.likesMap);
    });
  }

  protected resetProgressImmediate(id: PageRecordInterface['id']) {
    this.progressStorage.resetProgressImmediate(id);
  }

  protected resetAllProgressImmediate() {
    this.progressStorage.resetAllProgressImmediate();
  }
}
