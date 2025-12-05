import { Component, inject } from '@angular/core';
import { AutoIdDirective, IconDirective, VibrateDirective } from '../../directives';
import { DeviceNotifyService } from '@o2k/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'ui-device-notify-trigger',
  imports: [AutoIdDirective, VibrateDirective, IconDirective],
  templateUrl: './device-notify-trigger.component.html',
  styleUrl: './device-notify-trigger.component.scss',
})
export class DeviceNotifyTriggerComponent {
  protected readonly dns = inject(DeviceNotifyService);
  protected readonly enabled = toSignal(this.dns.enabled$.pipe(untilDestroyed(this)));
}
