import { Component, inject } from '@angular/core';
import { ContentContextService, CoordinatorService } from '@o2k/core';
import { RouterLink } from '@angular/router';
import {
  IconDirective,
  SafeHtmlPipe,
  ShareOnBlueskyComponent,
  ShareOnTwitterComponent,
  VibrateDirective,
} from '@o2k/ui';

@Component({
  selector: 'page-structure-outlet',
  imports: [
    RouterLink,
    IconDirective,
    ShareOnTwitterComponent,
    ShareOnBlueskyComponent,
    VibrateDirective,
    SafeHtmlPipe,
  ],
  templateUrl: './structure.outlet.html',
  styleUrl: './structure.outlet.scss',
})
export class StructureOutlet {
  protected coordinator = inject(CoordinatorService);
  protected context = inject(ContentContextService);

  protected closeStructure() {
    this.coordinator.toggleAsideOverlay(false);
  }
}
