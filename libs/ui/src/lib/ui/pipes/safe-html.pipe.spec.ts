import { SafeHtmlPipe } from './safe-html.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';

describe('SafeHtmlPipe', () => {
  let pipe: SafeHtmlPipe;
  let domSanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SafeHtmlPipe] });
    pipe = TestBed.inject(SafeHtmlPipe);
    domSanitizer = TestBed.inject(DomSanitizer);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns empty for null', () => {
    const out = pipe.transform(null);
    expect(out).toStrictEqual(domSanitizer.bypassSecurityTrustHtml(''));
  });

  it('returns bypassSecurityTrustHtml', () => {
    const out = pipe.transform(`<script>alert('foo');</script>`);
    expect(out).toStrictEqual(
      domSanitizer.bypassSecurityTrustHtml(`<script>alert('foo');</script>`)
    );
  });
});
