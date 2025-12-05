import { TestBed } from '@angular/core/testing';
import { provideConfig } from '@o2k/core';
import { ConfigService, SelectionService } from '.';
import { SelectObject, UiOption } from '..';

describe('SelectionService', () => {
  let service: SelectionService<SelectObject>;

  afterEach(() => {
    vi.resetAllMocks();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideConfig({ logger: 'OFF' }),
        SelectionService<SelectObject>,
        ConfigService<SelectObject>,
      ],
    });
    service = TestBed.inject(SelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#toggle should select single select', () => {
    vi.spyOn(service['configS'], 'isMultiple').mockReturnValue(false);
    const onChanges = vi.fn();
    service.changes$.subscribe(onChanges);

    const item: UiOption<SelectObject> = {
      hash: 'db2cae6c98f6ce52459b616d49db91884f8a248f',
      item: { label: 'label' },
      label: 'label',
    };
    service.toggle(item);
    service.toggle(item);

    expect(onChanges).toHaveBeenNthCalledWith(1, null);
    expect(onChanges).toHaveBeenNthCalledWith(2, {
      count: 1,
      emit: true,
      hash: '17ae13c1e4421455f03429f518c6bf752f63538c',
      items: [item],
      text: 'label',
      value: {
        label: 'label',
      },
    });
    expect(onChanges).toHaveBeenLastCalledWith({
      count: 1,
      emit: true,
      hash: '17ae13c1e4421455f03429f518c6bf752f63538c',
      items: [item],
      text: 'label',
      value: {
        label: 'label',
      },
    });
    expect(service.isSelected(item)).toStrictEqual(true);
    expect(service.hasSelection).toStrictEqual(true);
  });

  it('#toggle should toggle multiselect', () => {
    vi.spyOn(service['configS'], 'isMultiple').mockReturnValue(true);
    const onChanges = vi.fn();
    service.changes$.subscribe(onChanges);

    const item: UiOption<SelectObject> = {
      hash: 'db2cae6c98f6ce52459b616d49db91884f8a248f',
      item: { label: 'label' },
      label: 'label',
    };
    service.toggle(item);
    service.toggle(item);

    expect(onChanges).toHaveBeenNthCalledWith(1, null);
    expect(onChanges).toHaveBeenNthCalledWith(2, {
      count: 1,
      emit: true,
      hash: '17ae13c1e4421455f03429f518c6bf752f63538c',
      items: [item],
      text: 'label',
      value: {
        label: 'label',
      },
    });
    expect(onChanges).toHaveBeenLastCalledWith({
      count: 0,
      emit: true,
      hash: '56384caf74b0ba7701ee8a46a1ded8c14d1655d4',
      items: [],
      text: '',
      value: null,
    });
    expect(service.isSelected(item)).toStrictEqual(false);
    expect(service.hasSelection).toStrictEqual(false);
  });

  it('#select should publish initial empty', () => {
    vi.spyOn(service['configS'], 'isMultiple').mockReturnValue(false);
    const onChanges = vi.fn();
    service.changes$.subscribe(onChanges);

    service.select(null);

    expect(onChanges).toHaveBeenNthCalledWith(1, null);
    expect(onChanges).toHaveBeenLastCalledWith({
      count: 0,
      emit: true,
      hash: '56384caf74b0ba7701ee8a46a1ded8c14d1655d4',
      items: [],
      text: '',
      value: null,
    });
    expect(service.hasSelection).toStrictEqual(false);
  });

  it('#select should publish empty changes', () => {
    vi.spyOn(service['configS'], 'isMultiple').mockReturnValue(false);
    const onChanges = vi.fn();
    service.changes$.subscribe(onChanges);

    const item: UiOption<SelectObject> = {
      hash: 'db2cae6c98f6ce52459b616d49db91884f8a248f',
      item: { label: 'label' },
      label: 'label',
    };
    service.select(item);
    service.select(null);

    expect(onChanges).toHaveBeenNthCalledWith(1, null);
    expect(onChanges).toHaveBeenNthCalledWith(2, {
      count: 1,
      emit: true,
      hash: '17ae13c1e4421455f03429f518c6bf752f63538c',
      items: [item],
      text: 'label',
      value: {
        label: 'label',
      },
    });
    expect(onChanges).toHaveBeenLastCalledWith({
      count: 0,
      emit: true,
      hash: '56384caf74b0ba7701ee8a46a1ded8c14d1655d4',
      items: [],
      text: '',
      value: null,
    });
    expect(service.hasSelection).toStrictEqual(false);
  });

  it('#clear should publish empty changes', () => {
    vi.spyOn(service['configS'], 'isMultiple').mockReturnValue(false);
    const onChanges = vi.fn();
    service.changes$.subscribe(onChanges);

    service.clear();

    expect(onChanges).toHaveBeenNthCalledWith(1, null);
    expect(onChanges).toHaveBeenLastCalledWith({
      count: 0,
      emit: true,
      hash: '56384caf74b0ba7701ee8a46a1ded8c14d1655d4',
      items: [],
      text: '',
      value: null,
    });
    expect(service.hasSelection).toStrictEqual(false);
  });

  it('#clear should clear selection', () => {
    vi.spyOn(service['configS'], 'isMultiple').mockReturnValue(false);
    const onChanges = vi.fn();
    service.changes$.subscribe(onChanges);

    const item: UiOption<SelectObject> = {
      hash: 'db2cae6c98f6ce52459b616d49db91884f8a248f',
      item: { label: 'label' },
      label: 'label',
    };
    service.select(item);
    service.clear();

    expect(onChanges).toHaveBeenNthCalledWith(1, null);
    expect(onChanges).toHaveBeenNthCalledWith(2, {
      count: 1,
      emit: true,
      hash: '17ae13c1e4421455f03429f518c6bf752f63538c',
      items: [item],
      text: 'label',
      value: {
        label: 'label',
      },
    });
    expect(onChanges).toHaveBeenLastCalledWith({
      count: 0,
      emit: true,
      hash: '56384caf74b0ba7701ee8a46a1ded8c14d1655d4',
      items: [],
      text: '',
      value: null,
    });
    expect(service.hasSelection).toStrictEqual(false);
  });

  it('#deselect should publish empty', () => {
    vi.spyOn(service['configS'], 'isMultiple').mockReturnValue(false);
    const onChanges = vi.fn();
    service.changes$.subscribe(onChanges);

    const item: UiOption<SelectObject> = {
      hash: 'db2cae6c98f6ce52459b616d49db91884f8a248f',
      item: { label: 'label' },
      label: 'label',
    };
    service.deselect(item);

    expect(onChanges).toHaveBeenNthCalledWith(1, null);
    expect(onChanges).toHaveBeenLastCalledWith({
      count: 0,
      emit: true,
      hash: '56384caf74b0ba7701ee8a46a1ded8c14d1655d4',
      items: [],
      text: '',
      value: null,
    });
    expect(service.hasSelection).toStrictEqual(false);
  });

  it('#deselect should remove selection', () => {
    vi.spyOn(service['configS'], 'isMultiple').mockReturnValue(false);
    const onChanges = vi.fn();
    service.changes$.subscribe(onChanges);

    const item: UiOption<SelectObject> = {
      hash: 'db2cae6c98f6ce52459b616d49db91884f8a248f',
      item: { label: 'label' },
      label: 'label',
    };
    service.select(item);
    service.deselect(item);

    expect(onChanges).toHaveBeenNthCalledWith(1, null);
    expect(onChanges).toHaveBeenNthCalledWith(2, {
      count: 1,
      emit: true,
      hash: '17ae13c1e4421455f03429f518c6bf752f63538c',
      items: [item],
      text: 'label',
      value: {
        label: 'label',
      },
    });
    expect(onChanges).toHaveBeenLastCalledWith({
      count: 0,
      emit: true,
      hash: '56384caf74b0ba7701ee8a46a1ded8c14d1655d4',
      items: [],
      text: '',
      value: null,
    });
    expect(service.hasSelection).toStrictEqual(false);
  });
});
