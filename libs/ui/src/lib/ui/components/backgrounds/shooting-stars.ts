import { Component, input, InputSignal } from '@angular/core';

@Component({
  selector: 'ui-shooting-stars',
  imports: [],
  templateUrl: './shooting-stars.html',
  styleUrl: './shooting-stars.scss',
})
export class ShootingStars {
  readonly amount: InputSignal<number> = input<number>(8);
  protected readonly Array = Array;
}
