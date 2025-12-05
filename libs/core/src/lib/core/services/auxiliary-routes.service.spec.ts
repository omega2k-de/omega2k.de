import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe } from 'vitest';
import { AuxiliaryRoutesService } from './auxiliary-routes.service';

@Component({
  selector: 'core-dummy',
  template: '',
})
export class DummyComp {}

describe('AuxiliaryRoutesService', () => {
  let service: AuxiliaryRoutesService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'home',
            component: DummyComp,
          },
          {
            path: '',
            outlet: 'aside',
            component: DummyComp,
            children: [
              {
                path: 'menu',
                component: DummyComp,
              },
            ],
          },
          {
            path: 'open',
            outlet: 'footer',
            component: DummyComp,
          },
        ]),
      ],
    });
    service = TestBed.inject(AuxiliaryRoutesService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#activeAuxiliaryRoutes should publish auxiliary routes', () => {
    const data = [
      {
        command: ['/'],
        expected: {},
      },
      {
        command: ['home'],
        expected: {},
      },
      {
        command: ['', { outlets: { aside: ['menu'] } }],
        expected: { aside: true },
      },
      {
        command: ['', { outlets: { aside: ['menu'], footer: ['open'] } }],
        expected: { aside: true, footer: true },
      },
    ];

    it.each(data)('router $command should return $expected', async ({ command, expected }) => {
      await router.navigate(command);
      expect(service.activeAuxiliaryRoutes()).toStrictEqual(expected);
    });
  });

  describe('#activeAuxiliaryRoutes should publish auxiliary routes', () => {
    const data = [
      {
        command: ['/'],
        expected: true,
      },
      {
        command: ['home'],
        expected: true,
      },
      {
        command: ['', { outlets: { aside: ['menu'] } }],
        expected: false,
      },
      {
        command: ['', { outlets: { aside: ['menu'], footer: ['open'] } }],
        expected: false,
      },
    ];

    it.each(data)(
      'router $command should return $expected',
      fakeAsync(({ command, expected }: { command: []; expected: boolean }) => {
        router.navigate(command);
        let active = null;
        service.noAuxiliaryRouteActive$.subscribe(data => (active = data));
        tick();
        expect(active).toStrictEqual(expected);
      })
    );
  });

  describe('#activeAuxiliaryRoutes should publish auxiliary routes', () => {
    const data = [
      {
        command: ['/'],
        key: 'any',
        expected: false,
      },
      {
        command: ['home'],
        key: 'aside',
        expected: false,
      },
      {
        command: ['', { outlets: { aside: ['menu'] } }],
        key: 'aside',
        expected: true,
      },
      {
        command: ['', { outlets: { aside: ['menu'], footer: ['open'] } }],
        key: 'aside',
        expected: true,
      },
      {
        command: ['', { outlets: { aside: ['menu'], footer: ['open'] } }],
        key: 'footer',
        expected: true,
      },
    ];

    it.each(data)(
      'router $command should return $expected for $key',
      fakeAsync(({ command, key, expected }: { command: []; key: string; expected: boolean }) => {
        router.navigate(command);
        let active = null;
        service.isActive(key).subscribe(data => (active = data));
        tick();
        expect(active).toStrictEqual(expected);
      })
    );
  });
});
