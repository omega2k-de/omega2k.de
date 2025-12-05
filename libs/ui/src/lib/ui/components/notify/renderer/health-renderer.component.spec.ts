import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HealthRendererComponent } from './health-renderer.component';
import { HealthStatus } from '@o2k/core';

describe('HealthRendererComponent', () => {
  let component: HealthRendererComponent;
  let fixture: ComponentFixture<HealthRendererComponent>;
  const health: HealthStatus = {
    loadAvg: [],
    memory: 0,
    message: 'NOK',
    os: {
      cpus: 0,
      totalmem: 0,
      freemem: 0,
    },
    uptime: 0,
    usage: {
      rss: 0,
      heapTotal: 0,
      heapUsed: 0,
      external: 0,
      arrayBuffers: 0,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthRendererComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HealthRendererComponent);
    fixture.componentRef.setInput('health', health);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
