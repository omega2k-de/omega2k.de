import { Component, inject } from '@angular/core';
import { CoordinatorService } from '@o2k/core';

@Component({
  selector: 'ui-animated-backdrop',
  imports: [],
  templateUrl: './animated-backdrop.component.html',
  styleUrl: './animated-backdrop.component.scss',
})
export class AnimatedBackdropComponent {
  protected readonly coordinator = inject(CoordinatorService);
}
