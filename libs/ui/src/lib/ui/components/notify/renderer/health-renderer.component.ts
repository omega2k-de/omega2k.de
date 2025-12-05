import { Component, computed, input } from '@angular/core';
import dayjs from 'dayjs';
import { HealthStatus } from '@o2k/core';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import isLeapYear from 'dayjs/plugin/isLeapYear';

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(isLeapYear);

@Component({
  selector: 'ui-health-renderer',
  templateUrl: './health-renderer.component.html',
  styleUrl: './health-renderer.component.scss',
})
export class HealthRendererComponent {
  readonly health = input.required<HealthStatus>();

  readonly duration = computed(() =>
    dayjs.duration(this.health().uptime, 'seconds').format('Y[y] M[m] D[d] H[h] m[m] s[s]')
  );
  readonly freemem = computed(() => (this.health().os.freemem / 1024 / 1024 / 1000).toFixed(1));
  readonly totalmem = computed(() => (this.health().os.totalmem / 1024 / 1024 / 1000).toFixed(1));
}
