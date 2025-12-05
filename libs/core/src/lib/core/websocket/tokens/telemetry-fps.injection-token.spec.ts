import { TestBed } from '@angular/core/testing';
import { TELEMETRY_FPS } from './telemetry-fps.injection-token';

describe('TELEMETRY_FPS token', () => {
  it('defaults to 15', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(TELEMETRY_FPS)).toBe(15);
  });

  it('can be overridden', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: TELEMETRY_FPS, useValue: 60 }] });
    expect(TestBed.inject(TELEMETRY_FPS)).toBe(60);
  });
});
