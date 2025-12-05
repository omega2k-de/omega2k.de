import { expect } from 'vitest';
import { ArrayHelper, collectNavigableLoadComponentPaths } from '.';
import { Component } from '@angular/core';
import { Routes } from '@angular/router';

interface TestObject {
  prop1: string;
  prop2: string;
  prop3: string;
}

@Component({
  imports: [],
  template: ``,
})
class TestComponent {}

describe('ArrayHelper', () => {
  let service: ArrayHelper;

  const arr1 = [1, 2, 3, 4, 4, 4, 5, 5, 6, 6, 6, 7, 8, 8, 9];
  const arr2 = [1, true, null, {}, {}, null, true, false, Math.min];
  const arr3: TestObject[] = [
    {
      prop1: 'foo',
      prop2: 'bar',
      prop3: 'baz',
    },
    {
      prop1: 'foo',
      prop2: 'bar',
      prop3: 'baz',
    },
    {
      prop1: 'foo',
      prop2: 'bar',
      prop3: 'baz',
    },
    {
      prop1: 'foo',
      prop2: 'baz',
      prop3: 'bar',
    },
    {
      prop1: 'foo',
      prop2: 'bar',
      prop3: 'none',
    },
    {
      prop1: 'none',
      prop2: 'none',
      prop3: 'none',
    },
  ];

  beforeEach(() => {
    service = new ArrayHelper();
  });

  it('should create an instance', () => {
    expect(service).toBeInstanceOf(ArrayHelper);
  });

  it('#duplicateKeys should find duplicates', () => {
    expect(ArrayHelper.duplicateKeys(arr3, 'prop1')).toStrictEqual([
      'foo',
      'foo',
      'foo',
      'foo',
      'foo',
    ]);
    expect(ArrayHelper.duplicateKeys(arr3, 'prop2')).toStrictEqual(['bar', 'bar', 'bar', 'bar']);
    expect(ArrayHelper.duplicateKeys(arr3, 'prop3')).toStrictEqual([
      'baz',
      'baz',
      'baz',
      'none',
      'none',
    ]);
  });

  it('#filterUnique should filter duplicates', () => {
    expect(arr1.filter(ArrayHelper.filterUnique)).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(arr2.filter(ArrayHelper.filterUnique)).toStrictEqual([
      1,
      true,
      null,
      {},
      {},
      false,
      Math.min,
    ]);
  });

  it('#arrayUnique should filter duplicates', () => {
    expect(ArrayHelper.arrayUnique(arr1)).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(ArrayHelper.arrayUnique(arr2)).toStrictEqual([1, true, null, {}, {}, false, Math.min]);
  });

  it('#createUnique should filter duplicates', () => {
    expect(ArrayHelper.createUnique(arr1)).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(ArrayHelper.createUnique(arr2)).toStrictEqual([1, true, null, {}, {}, false, Math.min]);
  });

  it('#collectNavigableLoadComponentPaths should extract paths', () => {
    const routes: Routes = [
      {
        path: '',
        loadComponent: () => TestComponent,
      },
      {
        path: 'dashboard',
        loadComponent: () => TestComponent,
      },
      {
        path: '',
        outlet: 'outlet',
        loadComponent: () => TestComponent,
        children: [
          {
            path: 'outlet-child',
            loadComponent: () => TestComponent,
          },
        ],
      },
      {
        path: 'some',
        loadComponent: () => TestComponent,
        children: [
          {
            path: 'child',
            loadComponent: () => TestComponent,
          },
          {
            path: 'routes',
            loadComponent: () => TestComponent,
            children: [
              {
                path: 'a',
                loadComponent: () => TestComponent,
              },
              {
                path: 'b',
                loadComponent: () => TestComponent,
              },
              {
                path: 'c',
              },
            ],
          },
        ],
      },
    ];
    const data = collectNavigableLoadComponentPaths(routes);
    expect(data).toStrictEqual([
      '',
      '/dashboard',
      '/some',
      '/some/child',
      '/some/routes',
      '/some/routes/a',
      '/some/routes/b',
    ]);
  });
});
