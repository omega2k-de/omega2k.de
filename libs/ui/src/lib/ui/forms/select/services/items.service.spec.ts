import { TestBed } from '@angular/core/testing';
import { provideConfig } from '@o2k/core';
import { ConfigService, ItemsService, SelectionService } from '.';
import { Cursor, SelectionCursor, SelectObject, UiOption } from '..';

interface TestSearchData<T extends SelectObject> {
  search: string;
  callsExpected: number;
  expectedOptions: UiOption<T>[];
}
interface TestCursorData<T extends SelectObject> {
  search: string;
  index: number;
  expectedCursor: Cursor<T>;
}

interface TestEventData<T extends SelectObject> {
  item: SelectionCursor<T>;
  onCursorCalled: number;
}

describe('ItemsService', () => {
  let service: ItemsService<SelectObject>;
  const initialCursor: Cursor<SelectObject> = {
    curr: null,
    first: null,
    hash: 'd878be2d669f13c6a6a320413ca4451add59c853',
    last: null,
    next: null,
    nextPage: null,
    prev: null,
    prevPage: null,
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideConfig({ logger: 'OFF' }),
        ItemsService<SelectObject>,
        ConfigService<SelectObject>,
        SelectionService<SelectObject>,
      ],
    });
    service = TestBed.inject(ItemsService<SelectObject>);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('expect show all options if config set', () => {
    const onUiOptions = vi.fn();
    const onCursor = vi.fn();
    service.uiOptions$.subscribe(onUiOptions);
    service.cursor$.subscribe(onCursor);
    vi.spyOn(service['configS'], 'showAll').mockReturnValue(true);

    const uiItems = service.setAllItems(items);
    service.setSearchString('label 9');
    const item = service.findInAllByLabelStrict('label 9');
    service['selectionS'].select(item);

    expect(onUiOptions).toHaveBeenCalledTimes(4);
    expect(onUiOptions).toHaveBeenNthCalledWith(1, []);
    expect(onUiOptions).toHaveBeenNthCalledWith(2, uiItems);
    expect(onUiOptions).toHaveBeenNthCalledWith(3, [uiItems[9], uiItems[19]]);
    if (uiItems[9]) uiItems[9].selected = true;
    expect(onUiOptions).toHaveBeenNthCalledWith(4, uiItems);
    expect(service.getByIndex(0)).toStrictEqual(uiItems[0]);
    expect(service.getByIndex(1)).toStrictEqual(uiItems[1]);
    expect(service.getByIndex(2)).toStrictEqual(uiItems[2]);
    expect(service.getByIndex(99)).toStrictEqual(null);
  });

  it('#setSearchString should update search string', () => {
    const onSearchString = vi.fn();
    service.searchString$.subscribe(onSearchString);
    const onCursor = vi.fn();
    service.cursor$.subscribe(onCursor);

    service.setSearchString('some search');

    expect(onSearchString).toHaveBeenCalledTimes(2);
    expect(onSearchString).toHaveBeenNthCalledWith(1, '');
    expect(onSearchString).toHaveBeenNthCalledWith(2, 'some search');
    expect(onCursor).toHaveBeenNthCalledWith(1, initialCursor);
  });

  it('#cursor getter should return empty cursor', () => {
    const noHash = { ...initialCursor };
    delete noHash.hash;
    expect(service.cursor).toStrictEqual(noHash);
  });

  it('#current setter should update cursor', () => {
    const onCursor = vi.fn();
    service.cursor$.subscribe(onCursor);
    const uiItems = service.setAllItems(items);

    service.current = uiItems[0] as SelectionCursor<SelectObject>;
    service.current = null;
    service.current = { hash: '123' } as SelectionCursor<SelectObject>;

    expect(onCursor).toHaveBeenCalledTimes(5);
    expect(onCursor).toHaveBeenNthCalledWith(1, initialCursor);
    expect(onCursor).toHaveBeenNthCalledWith(2, {
      curr: null,
      first: {
        created: undefined,
        hash: '4250537376baaf3f648da5f61d3b4a3a716d7ebe',
        item: {
          label: 'label 0',
        },
        label: 'label 0',
        selected: false,
      },
      hash: 'f1b69a8ad704ee1823873deff722f8812ef597e9',
      last: {
        created: undefined,
        hash: 'ffab450a59cf6921ed5129dcd54e82a2d188709c',
        item: {
          label: 'label 19',
        },
        label: 'label 19',
        selected: false,
      },
      next: {
        created: undefined,
        hash: '4250537376baaf3f648da5f61d3b4a3a716d7ebe',
        item: {
          label: 'label 0',
        },
        label: 'label 0',
        selected: false,
      },
      nextPage: {
        created: undefined,
        hash: '4250537376baaf3f648da5f61d3b4a3a716d7ebe',
        item: {
          label: 'label 0',
        },
        label: 'label 0',
        selected: false,
      },
      prev: {
        created: undefined,
        hash: '4250537376baaf3f648da5f61d3b4a3a716d7ebe',
        item: {
          label: 'label 0',
        },
        label: 'label 0',
        selected: false,
      },
      prevPage: {
        created: undefined,
        hash: '4250537376baaf3f648da5f61d3b4a3a716d7ebe',
        item: {
          label: 'label 0',
        },
        label: 'label 0',
        selected: false,
      },
    });
    expect(onCursor).toHaveBeenNthCalledWith(3, {
      curr: {
        created: undefined,
        hash: '4250537376baaf3f648da5f61d3b4a3a716d7ebe',
        item: {
          label: 'label 0',
        },
        label: 'label 0',
        selected: false,
      },
      first: {
        created: undefined,
        hash: '4250537376baaf3f648da5f61d3b4a3a716d7ebe',
        item: {
          label: 'label 0',
        },
        label: 'label 0',
        selected: false,
      },
      hash: '645ef48dd28906251753a444fbffda20b2cfde92',
      last: {
        created: undefined,
        hash: 'ffab450a59cf6921ed5129dcd54e82a2d188709c',
        item: {
          label: 'label 19',
        },
        label: 'label 19',
        selected: false,
      },
      next: {
        created: undefined,
        hash: '3081fd6e876f802537b0adf850c357b1ed784d1a',
        item: {
          label: 'label 1',
        },
        label: 'label 1',
        selected: false,
      },
      nextPage: {
        created: undefined,
        hash: '5b6f703df627b66b19590f8de0a7d11c8c0b608b',
        item: {
          label: 'label 5',
        },
        label: 'label 5',
        selected: false,
      },
      prev: {
        created: undefined,
        hash: 'ffab450a59cf6921ed5129dcd54e82a2d188709c',
        item: {
          label: 'label 19',
        },
        label: 'label 19',
        selected: false,
      },
      prevPage: {
        created: undefined,
        hash: '009d1dabad4cf1d2e811f7ce6eed32ee1ab2f292',
        item: {
          label: 'label 15',
        },
        label: 'label 15',
        selected: false,
      },
    });
    expect(onCursor).toHaveBeenNthCalledWith(4, {
      curr: null,
      first: {
        created: undefined,
        hash: '4250537376baaf3f648da5f61d3b4a3a716d7ebe',
        item: {
          label: 'label 0',
        },
        label: 'label 0',
        selected: false,
      },
      hash: 'f1b69a8ad704ee1823873deff722f8812ef597e9',
      last: {
        created: undefined,
        hash: 'ffab450a59cf6921ed5129dcd54e82a2d188709c',
        item: {
          label: 'label 19',
        },
        label: 'label 19',
        selected: false,
      },
      next: {
        created: undefined,
        hash: '4250537376baaf3f648da5f61d3b4a3a716d7ebe',
        item: {
          label: 'label 0',
        },
        label: 'label 0',
        selected: false,
      },
      nextPage: {
        created: undefined,
        hash: '4250537376baaf3f648da5f61d3b4a3a716d7ebe',
        item: {
          label: 'label 0',
        },
        label: 'label 0',
        selected: false,
      },
      prev: {
        created: undefined,
        hash: '4250537376baaf3f648da5f61d3b4a3a716d7ebe',
        item: {
          label: 'label 0',
        },
        label: 'label 0',
        selected: false,
      },
      prevPage: {
        created: undefined,
        hash: '4250537376baaf3f648da5f61d3b4a3a716d7ebe',
        item: {
          label: 'label 0',
        },
        label: 'label 0',
        selected: false,
      },
    });
  });

  it('#cursor getter should return empty cursor', () => {
    const noHash = { ...initialCursor };
    delete noHash.hash;
    expect(service.cursor).toStrictEqual(noHash);
  });

  it('#setItems should render uiOptions$', () => {
    const onUiOptions = vi.fn();
    service.uiOptions$.subscribe(onUiOptions);

    service.setAllItems([
      {
        label: 'label 1',
      },
      {
        label: 'label 2',
      },
      {
        label: 'label 3',
      },
    ]);

    expect(onUiOptions).toHaveBeenCalledTimes(2);
    expect(onUiOptions).toHaveBeenNthCalledWith(1, []);
    expect(onUiOptions).toHaveBeenNthCalledWith(2, [
      {
        hash: '3081fd6e876f802537b0adf850c357b1ed784d1a',
        label: 'label 1',
        item: {
          label: 'label 1',
        },
        created: undefined,
        selected: false,
      },
      {
        hash: '1b43dd6a5597e4903e2a1e0aff85b6f78d7f6b0d',
        label: 'label 2',
        item: {
          label: 'label 2',
        },
        created: undefined,
        selected: false,
      },
      {
        hash: '667769d4975db431f97769b024da7e32952c09d7',
        label: 'label 3',
        item: {
          label: 'label 3',
        },
        created: undefined,
        selected: false,
      },
    ]);
  });

  const items: SelectObject[] = Array(20)
    .fill(0)
    .map((_, i) => ({
      label: 'label ' + i,
    }));

  const testEventItems: TestEventData<SelectObject>[] = [
    {
      onCursorCalled: 2,
      item: null,
    },
    {
      onCursorCalled: 2,
      item: {
        hash: '',
        item: {
          label: 'label 1',
        },
        label: 'label 1',
      },
    },
  ];

  test.each(testEventItems)(
    '#current setter should emit event without items on $item',
    ({ item, onCursorCalled }: TestEventData<SelectObject>) => {
      const onCursor = vi.fn();
      service.cursor$.subscribe(onCursor);

      service.current = item;

      expect(onCursor).toHaveBeenCalledTimes(onCursorCalled);
      expect(onCursor).toHaveBeenNthCalledWith(1, initialCursor);
      expect(onCursor).toHaveBeenNthCalledWith(2, initialCursor);
    }
  );

  const testSearchItems: TestSearchData<SelectObject>[] = [
    {
      search: 'label 5',
      callsExpected: 3,
      expectedOptions: [
        {
          created: undefined,
          hash: '5b6f703df627b66b19590f8de0a7d11c8c0b608b',
          item: {
            label: 'label 5',
          },
          label: 'label 5',
          selected: false,
        },
        {
          created: undefined,
          hash: '009d1dabad4cf1d2e811f7ce6eed32ee1ab2f292',
          item: {
            label: 'label 15',
          },
          label: 'label 15',
          selected: false,
        },
      ],
    },
    {
      search: 'label 10',
      callsExpected: 3,
      expectedOptions: [
        {
          created: undefined,
          hash: '10469290b090a750f2b10eed670b566bb42de70d',
          item: {
            label: 'label 10',
          },
          label: 'label 10',
          selected: false,
        },
      ],
    },
    {
      search: 'label 99',
      callsExpected: 3,
      expectedOptions: [],
    },
    {
      search: '2',
      callsExpected: 3,
      expectedOptions: [
        {
          created: undefined,
          hash: '1b43dd6a5597e4903e2a1e0aff85b6f78d7f6b0d',
          item: {
            label: 'label 2',
          },
          label: 'label 2',
          selected: false,
        },
        {
          created: undefined,
          hash: '9f89e0e6cfe58578296434c3daffc8b21b84b57d',
          item: {
            label: 'label 12',
          },
          label: 'label 12',
          selected: false,
        },
      ],
    },
    {
      search: '',
      callsExpected: 2,
      expectedOptions: [
        {
          created: undefined,
          hash: '4250537376baaf3f648da5f61d3b4a3a716d7ebe',
          item: {
            label: 'label 0',
          },
          label: 'label 0',
          selected: false,
        },
        {
          created: undefined,
          hash: '3081fd6e876f802537b0adf850c357b1ed784d1a',
          item: {
            label: 'label 1',
          },
          label: 'label 1',
          selected: false,
        },
        {
          created: undefined,
          hash: '1b43dd6a5597e4903e2a1e0aff85b6f78d7f6b0d',
          item: {
            label: 'label 2',
          },
          label: 'label 2',
          selected: false,
        },
        {
          created: undefined,
          hash: '667769d4975db431f97769b024da7e32952c09d7',
          item: {
            label: 'label 3',
          },
          label: 'label 3',
          selected: false,
        },
        {
          created: undefined,
          hash: '168dd17fd4ed9451e9ffc131e9b27981fc1f9bf5',
          item: {
            label: 'label 4',
          },
          label: 'label 4',
          selected: false,
        },
        {
          created: undefined,
          hash: '5b6f703df627b66b19590f8de0a7d11c8c0b608b',
          item: {
            label: 'label 5',
          },
          label: 'label 5',
          selected: false,
        },
        {
          created: undefined,
          hash: '5bc2e57910d20d11850a94f5c9dad643f07b7cb0',
          item: {
            label: 'label 6',
          },
          label: 'label 6',
          selected: false,
        },
        {
          created: undefined,
          hash: '33876911cd5605cb7628de39174c4f97dca2acd3',
          item: {
            label: 'label 7',
          },
          label: 'label 7',
          selected: false,
        },
        {
          created: undefined,
          hash: '6bf41f56a3a4a5afca45de570259963849997516',
          item: {
            label: 'label 8',
          },
          label: 'label 8',
          selected: false,
        },
        {
          created: undefined,
          hash: '39b355397702c9d187bde6be85bae232a8e43a89',
          item: {
            label: 'label 9',
          },
          label: 'label 9',
          selected: false,
        },
        {
          created: undefined,
          hash: '10469290b090a750f2b10eed670b566bb42de70d',
          item: {
            label: 'label 10',
          },
          label: 'label 10',
          selected: false,
        },
        {
          created: undefined,
          hash: '4820054d116ecdaeee1e40230e82e943ac866058',
          item: {
            label: 'label 11',
          },
          label: 'label 11',
          selected: false,
        },
        {
          created: undefined,
          hash: '9f89e0e6cfe58578296434c3daffc8b21b84b57d',
          item: {
            label: 'label 12',
          },
          label: 'label 12',
          selected: false,
        },
        {
          created: undefined,
          hash: '9f15a58ac1330bcdd034c3fd40924228d05bea3a',
          item: {
            label: 'label 13',
          },
          label: 'label 13',
          selected: false,
        },
        {
          created: undefined,
          hash: '46314109feb963edd3e1b4f30d6202a6082857e6',
          item: {
            label: 'label 14',
          },
          label: 'label 14',
          selected: false,
        },
        {
          created: undefined,
          hash: '009d1dabad4cf1d2e811f7ce6eed32ee1ab2f292',
          item: {
            label: 'label 15',
          },
          label: 'label 15',
          selected: false,
        },
        {
          created: undefined,
          hash: '8a427b8c5293690b3ab8b58699edfbdce9af642b',
          item: {
            label: 'label 16',
          },
          label: 'label 16',
          selected: false,
        },
        {
          created: undefined,
          hash: 'f9efba0e1aa04efc651a8bd8b08a27c66c3913b9',
          item: {
            label: 'label 17',
          },
          label: 'label 17',
          selected: false,
        },
        {
          created: undefined,
          hash: 'cc615eb3e97ff388b9e7fc734a90293397e5bd16',
          item: {
            label: 'label 18',
          },
          label: 'label 18',
          selected: false,
        },
        {
          created: undefined,
          hash: 'ffab450a59cf6921ed5129dcd54e82a2d188709c',
          item: {
            label: 'label 19',
          },
          label: 'label 19',
          selected: false,
        },
      ],
    },
  ];

  test.each(testSearchItems)(
    '#setSearchString with $search should filter list',
    ({ search, expectedOptions, callsExpected }: TestSearchData<SelectObject>) => {
      const onUiOptions = vi.fn();
      const onCursor = vi.fn();
      service.uiOptions$.subscribe(onUiOptions);
      service.cursor$.subscribe(onCursor);
      service.setAllItems(items);
      service.setSearchString(search);

      expect(onCursor).toHaveBeenCalledTimes(callsExpected);
      expect(onCursor).toHaveBeenNthCalledWith(1, initialCursor);

      expect(onUiOptions).toHaveBeenCalledTimes(callsExpected);
      expect(onUiOptions).toHaveBeenNthCalledWith(1, []);
      expect(onUiOptions).toHaveBeenNthCalledWith(callsExpected, expectedOptions);
    }
  );

  const testCursorItems: TestCursorData<SelectObject>[] = [
    {
      search: '2',
      expectedCursor: {
        curr: null,
        first: {
          created: undefined,
          hash: '1b43dd6a5597e4903e2a1e0aff85b6f78d7f6b0d',
          item: {
            label: 'label 2',
          },
          label: 'label 2',
          selected: false,
        },
        hash: '74bab4f65741d32bd57375e3b177a93d3d1e435b',
        last: {
          created: undefined,
          hash: '9f89e0e6cfe58578296434c3daffc8b21b84b57d',
          item: {
            label: 'label 12',
          },
          label: 'label 12',
          selected: false,
        },
        next: {
          created: undefined,
          hash: '1b43dd6a5597e4903e2a1e0aff85b6f78d7f6b0d',
          item: {
            label: 'label 2',
          },
          label: 'label 2',
          selected: false,
        },
        nextPage: {
          created: undefined,
          hash: '1b43dd6a5597e4903e2a1e0aff85b6f78d7f6b0d',
          item: {
            label: 'label 2',
          },
          label: 'label 2',
          selected: false,
        },
        prev: {
          created: undefined,
          hash: '1b43dd6a5597e4903e2a1e0aff85b6f78d7f6b0d',
          item: {
            label: 'label 2',
          },
          label: 'label 2',
          selected: false,
        },
        prevPage: {
          created: undefined,
          hash: '1b43dd6a5597e4903e2a1e0aff85b6f78d7f6b0d',
          item: {
            label: 'label 2',
          },
          label: 'label 2',
          selected: false,
        },
      },
      index: 1,
    },
    {
      search: 'label',
      expectedCursor: {
        curr: null,
        first: {
          created: undefined,
          hash: '4250537376baaf3f648da5f61d3b4a3a716d7ebe',
          item: {
            label: 'label 0',
          },
          label: 'label 0',
          selected: false,
        },
        hash: 'f1b69a8ad704ee1823873deff722f8812ef597e9',
        last: {
          created: undefined,
          hash: 'ffab450a59cf6921ed5129dcd54e82a2d188709c',
          item: {
            label: 'label 19',
          },
          label: 'label 19',
          selected: false,
        },
        next: {
          created: undefined,
          hash: '4250537376baaf3f648da5f61d3b4a3a716d7ebe',
          item: {
            label: 'label 0',
          },
          label: 'label 0',
          selected: false,
        },
        nextPage: {
          created: undefined,
          hash: '4250537376baaf3f648da5f61d3b4a3a716d7ebe',
          item: {
            label: 'label 0',
          },
          label: 'label 0',
          selected: false,
        },
        prev: {
          created: undefined,
          hash: '4250537376baaf3f648da5f61d3b4a3a716d7ebe',
          item: {
            label: 'label 0',
          },
          label: 'label 0',
          selected: false,
        },
        prevPage: {
          created: undefined,
          hash: '4250537376baaf3f648da5f61d3b4a3a716d7ebe',
          item: {
            label: 'label 0',
          },
          label: 'label 0',
          selected: false,
        },
      },
      index: 3,
    },
  ];

  test.each(testCursorItems)(
    '#current setter with $search should update cursor',
    ({ search, index, expectedCursor }: TestCursorData<SelectObject>) => {
      const onUiOptions = vi.fn();
      const onCursor = vi.fn();
      service.uiOptions$.subscribe(onUiOptions);
      service.cursor$.subscribe(onCursor);

      service.setSearchString(search);
      service.setAllItems(items);

      service.current = service.getFromAllByIndex(index);

      expect(onCursor).toHaveBeenNthCalledWith(1, initialCursor);
      expect(onCursor).toHaveBeenNthCalledWith(2, expectedCursor);
    }
  );
});
