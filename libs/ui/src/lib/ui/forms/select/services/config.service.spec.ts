import { TestBed } from '@angular/core/testing';
import { provideConfig } from '@o2k/core';
import { ConfigService } from '.';
import { SelectObject } from '..';

describe('ConfigService', () => {
  let service: ConfigService<SelectObject>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideConfig({ logger: 'OFF' }), ConfigService<SelectObject>],
    });
    service = TestBed.inject(ConfigService<SelectObject>);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#setOptions should update options', () => {
    service.setOptions({ displayItems: 10, mode: 'select', sorting: 'off' });

    expect(service.displayItems()).toStrictEqual(10);
    expect(service.mode()).toStrictEqual('select');
    expect(service.sorting()).toStrictEqual('off');
  });

  it('#setDisabled should publish disabled', () => {
    service.setDisabled(true);

    expect(service.disabled()).toStrictEqual(true);
  });

  it('#setControlName should publish control name', () => {
    service.setControlName('some-input');

    expect(service.name()).toStrictEqual('some-input');
  });
});
