import { TestBed } from '@angular/core/testing';
import { WINDOW } from './window.injection-token';
import { MockProvider } from 'ng-mocks';

describe('WINDOW token', () => {
  it('provides global window in browser-like environment', () => {
    TestBed.configureTestingModule({ providers: [MockProvider(WINDOW, undefined)] });
    const w = TestBed.inject(WINDOW);
    expect(w).toBeUndefined();
  });

  it('provides global window in browser-like environment', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const w = TestBed.inject(WINDOW);
    expect(w).toBeDefined();
  });
});
