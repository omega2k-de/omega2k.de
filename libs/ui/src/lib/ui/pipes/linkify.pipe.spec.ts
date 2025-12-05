import { TestBed } from '@angular/core/testing';
import { LinkifyPipe } from './linkify.pipe';
import { DomSanitizer } from '@angular/platform-browser';

describe('LinkifyPipe', () => {
  let pipe: LinkifyPipe;
  let domSanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [LinkifyPipe] });
    pipe = TestBed.inject(LinkifyPipe);
    domSanitizer = TestBed.inject(DomSanitizer);
  });

  it('returns empty for null', () => {
    const out = pipe.transform(null);
    expect(out).toStrictEqual(domSanitizer.bypassSecurityTrustHtml(''));
  });

  it('linkifies https urls', () => {
    const out = pipe.transform('visit https://omega2k.de please');
    const html = String(out);
    expect(html).toContain(
      '<a href="https://omega2k.de" target="_blank" rel="noopener noreferrer">https://omega2k.de</a>'
    );
  });

  it('linkifies www urls and adds https', () => {
    const out = pipe.transform('go to www.omega2k.de now');
    const html = String(out);
    expect(html).toContain(
      '<a href="https://www.omega2k.de" target="_blank" rel="noopener noreferrer">www.omega2k.de</a>'
    );
  });

  it('does not break normal text', () => {
    const out = pipe.transform('hello world');
    expect(out).toStrictEqual(domSanitizer.bypassSecurityTrustHtml('hello world'));
  });

  it('escapes raw <script> tags', () => {
    const out = pipe.transform('<script>alert(1)</script>');
    const html = String(out);
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('does not create links for javascript: urls', () => {
    const out = pipe.transform('javascript:alert(1)');
    const html = String(out);
    expect(out).toStrictEqual(domSanitizer.bypassSecurityTrustHtml('javascript:alert(1)'));
    expect(html).not.toContain('<a');
  });

  it('does not create links for data: urls', () => {
    const out = pipe.transform('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==');
    expect(out).toStrictEqual(
      domSanitizer.bypassSecurityTrustHtml(
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/&/g, '&amp;')
      )
    );
    expect(out).not.toContain('<a');
  });

  it('neutralizes img onerror injection', () => {
    const payload = `<img src=x onerror=alert(1)> https://omega2k.de`;
    const out = pipe.transform(payload);
    const html = String(out);
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain(
      '<a href="https://omega2k.de" target="_blank" rel="noopener noreferrer">https://omega2k.de</a>'
    );
  });

  it('prevents breaking out of attribute', () => {
    const payload = `https://omega2k.de" onclick="alert(1)`;
    const out = pipe.transform(payload);
    const html = String(out);
    expect(out).toStrictEqual(
      domSanitizer.bypassSecurityTrustHtml(
        '<a href="https://omega2k.de&quot" target="_blank" rel="noopener noreferrer">https://omega2k.de&quot</a>; onclick=&quot;alert(1)'
      )
    );
    expect(html).toStrictEqual(
      `SafeValue must use [property]=binding: <a href="https://omega2k.de&quot" target="_blank" rel="noopener noreferrer">https://omega2k.de&quot</a>; onclick=&quot;alert(1) (see https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss)`
    );
    expect(html).not.toContain('onclick="alert(1)"');
  });
});
