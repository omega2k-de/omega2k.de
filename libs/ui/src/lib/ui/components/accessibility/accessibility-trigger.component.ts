import { Component, DOCUMENT, effect, inject, OnInit, Renderer2, signal } from '@angular/core';
import { AutoIdDirective, IconDirective, VibrateDirective } from '../../directives';
import { LocalStorageService } from '@o2k/core';

@Component({
  selector: 'ui-accessibility-trigger',
  imports: [AutoIdDirective, VibrateDirective, IconDirective],
  templateUrl: './accessibility-trigger.component.html',
  styleUrl: './accessibility-trigger.component.scss',
})
export class AccessibilityTriggerComponent implements OnInit {
  private readonly storageKey = 'o2k.accessibility';
  private features = new Map<string, boolean>();
  private document = inject(DOCUMENT);
  private renderer2 = inject(Renderer2);
  private storage = inject(LocalStorageService);
  protected readonly enabled = signal<boolean>(false);

  constructor() {
    effect(() => {
      const largeFont = this.enabled();
      if (largeFont) {
        this.renderer2.addClass(this.document.body, 'large-font');
      } else {
        this.renderer2.removeClass(this.document.body, 'large-font');
      }
    });
  }

  ngOnInit() {
    try {
      const stored = (JSON.parse(this.storage.get(this.storageKey) ?? '[]') as string[])
        .map((feature): [string, boolean][] => [[feature, true]])
        .flat(1);
      this.features = new Map<string, boolean>(stored);
      this.enabled.set(this.features.has('large-font'));
    } catch (_) {
      // noop
    }
  }

  toggle() {
    this.enabled.set(!this.enabled());
    if (this.enabled()) {
      this.features.set('large-font', true);
    } else {
      this.features.delete('large-font');
    }
    this.storage.save(this.storageKey, JSON.stringify(Array.from(this.features.keys())));
  }
}
