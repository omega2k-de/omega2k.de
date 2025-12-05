import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, createUrlTreeFromSnapshot, provideRouter } from '@angular/router';
import { redirectByCommand } from '.';

describe('GuardHelper', () => {
  let activatedRoute: ActivatedRoute;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideRouter([])],
    });

    activatedRoute = TestBed.inject(ActivatedRoute);
  });

  it('should create minimum instance', () => {
    expect(redirectByCommand(['some', 'command'], activatedRoute.snapshot)).toStrictEqual(
      createUrlTreeFromSnapshot(activatedRoute.snapshot, ['some', 'command'], null, '')
    );
  });

  it('should create full instance', () => {
    expect(
      redirectByCommand(
        ['some', 'command'],
        activatedRoute.snapshot,
        { param1: 'value1' },
        'fragment'
      )
    ).toStrictEqual(
      createUrlTreeFromSnapshot(
        activatedRoute.snapshot,
        ['some', 'command'],
        { param1: 'value1' },
        'fragment'
      )
    );
  });
});
