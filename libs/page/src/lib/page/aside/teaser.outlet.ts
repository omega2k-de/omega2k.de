import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconDirective, VersionComponent } from '@o2k/ui';

@Component({
  selector: 'page-teaser-outlet',
  imports: [RouterLink, IconDirective, VersionComponent],
  templateUrl: './teaser.outlet.html',
  styleUrl: './teaser.outlet.scss',
})
export class TeaserOutlet {}
