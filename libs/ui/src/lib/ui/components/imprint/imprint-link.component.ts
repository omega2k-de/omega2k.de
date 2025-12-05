import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VibrateDirective } from '../../directives';

@Component({
  selector: 'ui-imprint-link',
  imports: [RouterLink, VibrateDirective],
  templateUrl: './imprint-link.component.html',
  styleUrl: './imprint-link.component.scss',
})
export class ImprintLinkComponent {}
