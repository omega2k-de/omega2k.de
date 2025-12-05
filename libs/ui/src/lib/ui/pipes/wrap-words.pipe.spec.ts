import { CommonModule } from '@angular/common';
import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { MockProvider } from 'ng-mocks';
import { WrapWordsPipe } from './wrap-words.pipe';

@Component({
  imports: [CommonModule, WrapWordsPipe],
  template: `<span #span [innerHTML]="text() | wrapWords: search() : separator()"></span>`,
})
class TestComponent {
  @ViewChild('span') span!: ElementRef<HTMLSpanElement>;
  text = signal<string | undefined>(undefined);
  search = signal<string>('');
  separator = signal<string>(' ');
}

describe('WrapWordsPipe', () => {
  let fixture: ComponentFixture<TestComponent>;
  const bypassSecurityTrustHtml = vi.fn().mockImplementation(str => str);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, WrapWordsPipe],
      providers: [MockProvider(DomSanitizer, { bypassSecurityTrustHtml })],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create an instance', () => {
    fixture.componentInstance.text.set(undefined);
    expect(fixture.componentInstance.span.nativeElement.innerHTML).toStrictEqual('');
    expect(bypassSecurityTrustHtml).toHaveBeenCalledTimes(0);
  });

  it('should use dom sanitizer for text', () => {
    fixture.componentInstance.text.set('some text with high text');
    fixture.componentInstance.search.set('');
    fixture.componentInstance.separator.set(' ');
    fixture.detectChanges();
    expect(fixture.componentInstance.span.nativeElement.innerHTML).toStrictEqual(
      'some text with high text'
    );
    expect(bypassSecurityTrustHtml).toHaveBeenCalledTimes(1);
  });

  it('should render text and use cache', () => {
    fixture.componentInstance.text.set('some text with high text');
    fixture.componentInstance.search.set('text it');
    fixture.componentInstance.separator.set(' ');
    fixture.detectChanges();
    fixture.componentInstance.search.set('text it');
    fixture.detectChanges();
    expect(fixture.componentInstance.span.nativeElement.innerHTML).toStrictEqual(
      'some <mark>text</mark> w<mark>it</mark>h high <mark>text</mark>'
    );
    expect(bypassSecurityTrustHtml).toHaveBeenCalledTimes(1);
  });
});
