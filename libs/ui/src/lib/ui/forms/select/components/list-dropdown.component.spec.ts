import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideConfig } from '@o2k/core';
import { ListDropdownComponent } from '.';
import { ConfigService, FocusService, ItemsService, SelectionService, SelectObject } from '..';

describe('ListDropdownComponent', () => {
  let component: ListDropdownComponent<SelectObject>;
  let fixture: ComponentFixture<ListDropdownComponent<SelectObject>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDropdownComponent<SelectObject>],
      providers: [
        provideConfig({ logger: 'OFF' }),
        ItemsService<SelectObject>,
        ConfigService<SelectObject>,
        FocusService<SelectObject>,
        SelectionService<SelectObject>,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListDropdownComponent<SelectObject>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
