import { IsActiveMatchOptions, NavigationExtras } from '@angular/router';
import { CommandOrUrlTreeType } from '../types/command-or-url-tree.type';
import { UiIconType } from '../types/ui-icon.type';

export interface ButtonConfigAction {
  action: 'add' | 'remove' | 'swap';
  button: ButtonConfig;
}

export interface ButtonConfig extends NavigationExtras {
  routerLinkActiveOptions?: { exact: boolean } | IsActiveMatchOptions;
  routerLink: CommandOrUrlTreeType;
  label: string;
  uiIcon: UiIconType;
}
