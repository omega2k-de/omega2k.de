import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalStorageService, provideConfig } from '@o2k/core';
import { MockComponents, MockDirectives, MockProvider } from 'ng-mocks';
import { AutoIdDirective, IconDirective, VibrateDirective } from '../../../directives';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { ChatWindowComponent } from './chat-window.component';
import { ChatMessageComponent } from './chat-message.component';
import { ToggleChatComponent } from './toggle-chat.component';

describe('ToggleChatComponent', () => {
  let component: ToggleChatComponent;
  let fixture: ComponentFixture<ToggleChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ToggleChatComponent,
        MockDirectives(
          AutoIdDirective,
          IconDirective,
          CdkOverlayOrigin,
          CdkConnectedOverlay,
          VibrateDirective
        ),
        MockComponents(ChatWindowComponent, ChatMessageComponent),
      ],
      providers: [
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        MockProvider(LocalStorageService),
        provideConfig({ logger: 'OFF' }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#toggleDialog should toggle', () => {
    const event = new MouseEvent('click');
    component.toggleDialog(event);
    expect(component.dialogOpen()).toStrictEqual(true);
    const event2 = new MouseEvent('click');
    component.toggleDialog(event2);
    expect(component.dialogOpen()).toStrictEqual(false);
  });
});
