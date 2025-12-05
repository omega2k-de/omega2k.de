import { Component, input, output } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { GaugePipe } from '../../../pipes';

@UntilDestroy()
@Component({
  selector: 'ui-entropy-dropdown',
  imports: [GaugePipe],
  templateUrl: './entropy-dropdown.component.html',
  styleUrl: './entropy-dropdown.component.scss',
})
export class EntropyDropdownComponent {
  readonly touched = output();
  text = input<string>('');
}
