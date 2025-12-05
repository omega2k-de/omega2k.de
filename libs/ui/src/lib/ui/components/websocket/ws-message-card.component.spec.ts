import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WsMessageCardComponent } from './';

describe('WsMessageCardComponent', () => {
  let component: WsMessageCardComponent;
  let fixture: ComponentFixture<WsMessageCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WsMessageCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WsMessageCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('message', {
      author: {
        uuid: '1337',
      },
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
