import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  output,
  Renderer2,
  Signal,
  TrackByFunction,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LoggerService, WINDOW } from '@o2k/core';
import { distinctUntilChanged, map, pairwise } from 'rxjs';
import { Cursor, SelectObject, UiOption } from '..';
import { IconDirective, VibrateDirective } from '../../../directives';
import { WrapWordsPipe } from '../../../pipes';
import { ConfigService, FocusService, ItemsService, SelectionService } from '../services';

interface PairwiseCursorInterface<T extends SelectObject> {
  prev: Cursor<T>;
  next: Cursor<T>;
}

@UntilDestroy()
@Component({
  selector: 'ui-list-dropdown',
  imports: [ScrollingModule, IconDirective, VibrateDirective, WrapWordsPipe],
  templateUrl: './list-dropdown.component.html',
  styleUrl: './list-dropdown.component.scss',
})
export class ListDropdownComponent<T extends SelectObject> implements AfterViewInit {
  protected itemsS: ItemsService<T> = inject(ItemsService<T>, { self: false });
  protected elementRef: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);
  protected renderer2: Renderer2 = inject(Renderer2);
  protected logger: LoggerService = inject(LoggerService);
  protected readonly window?: Window = inject(WINDOW);
  protected configS: ConfigService<T> = inject(ConfigService<T>, { self: false });
  protected focusS: FocusService<T> = inject(FocusService<T>, { self: false });
  protected selectionS: SelectionService<T> = inject(SelectionService<T>, { self: false });
  @ViewChild('cdkVirtualScrollViewport') cdkVirtualScrollViewport?: CdkVirtualScrollViewport;
  readonly touched = output();
  searchString: InputSignal<string> = input<string>('');
  protected trimmedSearchString = computed(() => this.searchString().trim());
  scrolledIndex = 0;
  distinctCurrentCursorHash = toSignal(
    this.itemsS.cursor$.pipe(
      distinctUntilChanged((a, b) => a.hash === b.hash),
      map(cursor => cursor.curr?.hash ?? null)
    ),
    { initialValue: null }
  );
  pairwiseCursors = toSignal<PairwiseCursorInterface<T>>(
    this.itemsS.cursor$.pipe(
      distinctUntilChanged((a, b) => a.hash === b.hash),
      pairwise(),
      map(
        ([prev, next]) =>
          <PairwiseCursorInterface<T>>{
            prev,
            next,
          }
      ),
      untilDestroyed(this)
    )
  );
  items: Signal<UiOption<T>[]> = toSignal(this.itemsS.uiOptions$, { initialValue: [] });
  protected viewportRootVars: Signal<string> = computed(() => {
    const max = this.configS.displayItems();
    const itemHeightPx = this.configS.itemHeightPx();
    const displayCount = Math.max(0, Math.min(this.items().length, max));
    return `--display-count:${displayCount};--item-height-px:${itemHeightPx}px;`;
  });

  constructor() {
    effect(() => {
      const cursors = this.pairwiseCursors();
      if (cursors?.prev && cursors?.next) {
        this.scrollIfRequired(cursors.prev, cursors.next);
      }
    });

    this.itemsS.cursor$
      .pipe(
        distinctUntilChanged((a, b) => a.hash === b.hash),
        pairwise(),
        map(
          ([prev, next]) =>
            <PairwiseCursorInterface<T>>{
              prev,
              next,
            }
        ),
        untilDestroyed(this)
      )
      .subscribe(cursors => this.scrollIfRequired(cursors.prev, cursors.next));
  }

  ngAfterViewInit(): void {
    this.renderer2.setAttribute(this.elementRef.nativeElement, 'tabindex', '-1');
  }

  trackBy: TrackByFunction<UiOption<T>> = (_index, option) => option.hash;

  selectOption(event: Event, option: UiOption<T>) {
    this.logger.debug(`ListDropdownComponent:${this.configS.name()}`, 'selectOption', {
      event,
      option,
    });
    event.preventDefault();
    this.selectionS.toggle(option);
    if (this.configS.isMultiple()) {
      this.cdkVirtualScrollViewport?.elementRef.nativeElement.focus();
    } else {
      this.touched.emit();
    }
  }

  isCursor(option: UiOption<T>) {
    return this.distinctCurrentCursorHash() === option.hash;
  }

  private scrollIfRequired(prev: Cursor<T>, next: Cursor<T>): void {
    const index = this.itemsS.indexOf(next.curr ?? prev.curr);
    const scrollIndex = this.scrolledIndex;
    const displayItems = this.configS.displayItems();
    const endIndex = Math.floor(scrollIndex + displayItems - 1);

    if (index >= scrollIndex && index <= endIndex) {
      return;
    }

    const direction: 'up' | 'down' =
      prev.curr === next.next || prev.curr === next.nextPage ? 'up' : 'down';
    this.logger.info(`ListDropdownComponent:${this.configS.name()}`, 'scrollIfRequired', {
      direction,
      index,
      scrollIndex,
      endIndex,
      displayItems,
    });
    switch (direction) {
      case 'up':
        if (index > endIndex) {
          this.scrollToIndex(Math.ceil(this.items().length - displayItems));
        } else if (index < scrollIndex) {
          this.scrollToIndex(index);
        }
        break;
      case 'down':
        this.scrollToIndex(Math.ceil(index - displayItems + 1));
        break;
    }
  }

  private scrollToIndex(index: number, behavior: ScrollBehavior = 'instant') {
    const viewport = this.cdkVirtualScrollViewport;
    this.logger.info(`ListDropdownComponent:${this.configS.name()}`, 'scrollToIndex', {
      index,
      behavior,
      viewport,
    });
    if (viewport) {
      viewport.scrollToIndex(index, behavior);
      this.scrolledIndex = index;
    }
  }
}
