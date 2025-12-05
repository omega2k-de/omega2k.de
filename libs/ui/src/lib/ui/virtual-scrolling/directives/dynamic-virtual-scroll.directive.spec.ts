import { TestBed } from '@angular/core/testing';
import { MockProviders } from 'ng-mocks';
import { DynamicVirtualScrollDirective } from './dynamic-virtual-scroll.directive';
import { DynamicVirtualScrollStrategy } from '../strategies';

describe('DynamicVirtualScrollDirective', () => {
  let directive: DynamicVirtualScrollDirective;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [DynamicVirtualScrollDirective, MockProviders(DynamicVirtualScrollStrategy)],
    }).compileComponents();

    directive = TestBed.inject(DynamicVirtualScrollDirective);
  });

  it('should create', () => {
    expect(directive).toBeTruthy();
  });
});
