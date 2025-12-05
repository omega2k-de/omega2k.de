import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';

const ActiveZone = 150; // pixels

@Component({
  selector: 'ui-infinite-scroll',
  imports: [CommonModule],
  templateUrl: './infinite-scroll.component.html',
  styleUrl: './infinite-scroll.component.scss',
})
export class InfiniteScrollComponent implements OnInit, OnDestroy {
  private _elRef: ElementRef = inject(ElementRef);
  private _renderer: Renderer2 = inject(Renderer2);
  private _unlisten!: () => void;
  private _endLock = false;
  @Output() endReached = new EventEmitter<void>();

  ngOnInit() {
    const parent = this._elRef.nativeElement.parentElement;

    this._unlisten = this._renderer.listen(parent, 'scroll', (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollTop = target.scrollTop + target.clientHeight;
      const endReached = scrollTop + ActiveZone >= target.scrollHeight;

      if (endReached && !this._endLock) {
        this.endReached.emit();
        this._endLock = true;
      } else if (!endReached) {
        this._endLock = false;
      }
    });
  }

  ngOnDestroy() {
    this._unlisten();
  }
}
