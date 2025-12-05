import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatWindowComponent } from './chat-window.component';
import { MockComponents, MockDirectives, MockProvider } from 'ng-mocks';
import { AutoIdDirective, IconDirective } from '../../../directives';
import { DynamicVirtualScrollDirective } from '../../../virtual-scrolling';
import {
  CdkVirtualForOf,
  CdkVirtualScrollableElement,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { ChatMessageComponent } from './chat-message.component';
import { ChatService } from '../services';
import { BehaviorSubject } from 'rxjs';
import { ChatMessageEntryInterface } from '../interfaces';

describe('ChatWindowComponent', () => {
  let component: ChatWindowComponent;
  let fixture: ComponentFixture<ChatWindowComponent>;

  const messagesSubject = new BehaviorSubject<ChatMessageEntryInterface[]>([]);
  const messages$ = messagesSubject.asObservable();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ChatWindowComponent,
        MockDirectives(
          AutoIdDirective,
          IconDirective,
          DynamicVirtualScrollDirective,
          CdkVirtualForOf,
          CdkVirtualScrollableElement
        ),
        MockComponents(ChatMessageComponent, CdkVirtualScrollViewport),
      ],
      providers: [
        MockProvider(ChatService, {
          messages$,
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#send should not send empty form', () => {
    const resetSpy = vi.spyOn(component.form, 'reset');

    component.send();

    expect(resetSpy).not.toHaveBeenCalled();
  });

  it('#send should sendMessage and reset', () => {
    component.form.patchValue({ message: 'some message' });
    const sendMessageSpy = vi.spyOn(component['chat'], 'sendMessage');
    const resetSpy = vi.spyOn(component.form, 'reset');

    component.send();

    expect(resetSpy).toHaveBeenCalledTimes(1);
    expect(sendMessageSpy).toHaveBeenCalledTimes(1);
    expect(sendMessageSpy).toHaveBeenCalledWith('some message');
  });

  it('#send should updateServerUser and reset', () => {
    component.form.patchValue({ message: '/user My User Name' });
    const updateServerUserSpy = vi.spyOn(component['chat'], 'updateServerUser');
    const resetSpy = vi.spyOn(component.form, 'reset');

    component.send();

    expect(resetSpy).toHaveBeenCalledTimes(1);
    expect(updateServerUserSpy).toHaveBeenCalledTimes(1);
    expect(updateServerUserSpy).toHaveBeenCalledWith({ name: 'My User Name' });
  });

  it('#keydownHandler should send on enter', () => {
    component.form.patchValue({ message: '/user My User Name' });
    const sendSpy = vi.spyOn(component, 'send');
    const event = new KeyboardEvent('keydown', {
      keyCode: 13,
      code: 'Enter',
      key: 'Enter',
    });

    component['keydownHandler'](event);

    expect(sendSpy).toHaveBeenCalledTimes(1);
  });

  it('#keydownHandler should bypass on shift + enter', () => {
    component.form.patchValue({ message: '/user My User Name' });
    const sendSpy = vi.spyOn(component, 'send');
    const event = new KeyboardEvent('keydown', {
      keyCode: 13,
      code: 'Enter',
      key: 'Enter',
      shiftKey: true,
    });

    component['keydownHandler'](event);

    expect(sendSpy).not.toHaveBeenCalled();
  });
});
