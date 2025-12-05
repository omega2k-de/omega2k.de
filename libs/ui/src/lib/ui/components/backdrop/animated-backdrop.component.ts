import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-animated-backdrop',
  imports: [],
  templateUrl: './animated-backdrop.component.html',
  styleUrl: './animated-backdrop.component.scss',
})
export class AnimatedBackdropComponent {
  readonly show = input<boolean>(false);
}
