import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatMessageComponent } from './chat-message.component';
import { ChatMessageEntryInterface } from '../interfaces';
import dayjs from 'dayjs';
import { MockPipes } from 'ng-mocks';
import { LinkifyPipe } from '../../../pipes';

describe('ChatMessageComponent', () => {
  let component: ChatMessageComponent;
  let fixture: ComponentFixture<ChatMessageComponent>;
  const message: ChatMessageEntryInterface = {
    created: dayjs(),
    direction: 'receive',
    uuid: '12345',
    message: 'some string',
    author: {
      uuid: '1337',
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMessageComponent, MockPipes(LinkifyPipe)],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatMessageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('message', message);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
