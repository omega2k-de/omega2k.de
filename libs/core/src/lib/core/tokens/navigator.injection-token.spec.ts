import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { NAVIGATOR } from './navigator.injection-token';

describe('NAVIGATOR token', () => {
  it('provides global navigator in browser-like environment', () => {
    TestBed.configureTestingModule({ providers: [MockProvider(NAVIGATOR, undefined)] });
    const w = TestBed.inject(NAVIGATOR);
    expect(w).toBeUndefined();
  });

  it('provides global navigator in browser-like environment', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const w = TestBed.inject(NAVIGATOR);
    expect(w).toBeDefined();
  });
});
