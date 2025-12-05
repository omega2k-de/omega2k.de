import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationService } from '@o2k/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLinkDirective } from '../directives';

@Component({
  selector: 'ui-header-nav',
  imports: [RouterLink, RouterLinkActive, RouterLinkDirective],
  templateUrl: './header-nav.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderNavComponent {
  private readonly navigation = inject(NavigationService);
  readonly items = toSignal(this.navigation.loadByLocation('header'), { initialValue: [] });
}
