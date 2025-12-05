import { TestBed } from '@angular/core/testing';
import CryptoJS from 'crypto-js';
import mockDate from 'mockdate';
import { afterEach, MockInstance } from 'vitest';
import { WINDOW } from '../tokens';
import { LOCAL_STORAGE_ENCRYPTION_KEY, LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  let _window: Window | undefined;
  let decryptMock: MockInstance;
  let encryptMock: MockInstance;

  let localStorageEncryptionKey: string | null = 'key';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LocalStorageService,
        {
          provide: LOCAL_STORAGE_ENCRYPTION_KEY,
          useFactory: () => localStorageEncryptionKey,
        },
      ],
    });

    mockDate.set(1752952580109);

    _window = TestBed.inject(WINDOW);

    decryptMock = vi
      .spyOn(CryptoJS.AES, 'decrypt')
      .mockImplementation(text => text as unknown as CryptoJS.lib.WordArray);
    encryptMock = vi
      .spyOn(CryptoJS.AES, 'encrypt')
      .mockImplementation(text => text as unknown as CryptoJS.lib.CipherParams);
  });

  afterEach(() => {
    localStorageEncryptionKey = 'key';
    decryptMock.mockReset();
    encryptMock.mockReset();
    mockDate.reset();
  });

  it('should be created', () => {
    service = TestBed.inject(LocalStorageService);
    expect(service).toBeTruthy();
  });

  it('#saveData should call localStorage.setItem', () => {
    service = TestBed.inject(LocalStorageService);
    service.save('key', 'data');
    expect(_window?.localStorage.getItem('key')).toBe('data"""1752952580109');
    expect(decryptMock).not.toHaveBeenCalled();
    expect(encryptMock).toHaveBeenCalledWith('data"""1752952580109', localStorageEncryptionKey);
  });

  it('#getData should not call decrypt on localStorage.getItem', () => {
    localStorageEncryptionKey = null;
    service = TestBed.inject(LocalStorageService);
    service.get('key');
    expect(decryptMock).not.toHaveBeenCalled();
    expect(encryptMock).not.toHaveBeenCalled();
  });

  it('#getData should call decrypt on localStorage.getItem', () => {
    service = TestBed.inject(LocalStorageService);
    service.get('key');
    expect(decryptMock).toHaveBeenCalledWith('data"""1752952580109', localStorageEncryptionKey);
    expect(encryptMock).not.toHaveBeenCalled();
  });

  it('#getData should return data if timeout not reached localStorage.getItem', () => {
    mockDate.set(1752952580109);
    service = TestBed.inject(LocalStorageService);
    const data = service.get('key', 2000);
    expect(data).toStrictEqual('data');
    expect(decryptMock).toHaveBeenCalledWith('data"""1752952580109', localStorageEncryptionKey);
    expect(encryptMock).not.toHaveBeenCalled();
  });

  it('#getData should return null if timeout reached localStorage.getItem', () => {
    mockDate.set(1752952583109);
    service = TestBed.inject(LocalStorageService);
    const data = service.get('key', 2000);
    expect(data).toStrictEqual(null);
    expect(decryptMock).toHaveBeenCalledWith('data"""1752952580109', localStorageEncryptionKey);
    expect(encryptMock).not.toHaveBeenCalled();
  });

  it('#removeData should call localStorage.removeItem', () => {
    mockDate.set(1752952580109);
    service = TestBed.inject(LocalStorageService);
    service.remove('key');
  });
});
