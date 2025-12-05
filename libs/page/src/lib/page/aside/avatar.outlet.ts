import { Component } from '@angular/core';
import { FigureComponent, FigureConfig } from '@o2k/ui';

@Component({
  selector: 'page-avatar-outlet',
  imports: [FigureComponent],
  templateUrl: './avatar.outlet.html',
  styleUrl: './avatar.outlet.scss',
})
export class AvatarOutlet {
  protected figure1: FigureConfig = {
    image: {
      width: 400,
      height: 400,
      path: '/cdn/images/xn__2k_dcc.webp',
      alt: 'Mein aktuelles Profil-Bild auf X/Twitter',
    },
    legend: 'Profil-Bild: X/Twitter',
  };
}
