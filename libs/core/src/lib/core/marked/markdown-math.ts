import katex from 'katex';

const DISPLAY_MATH_DOLLAR = /\$\$([\s\S]+?)\$\$/g;
const DISPLAY_MATH_BRACKET = /\\\[([\s\S]+?)\\]/g;
const INLINE_MATH_DOLLAR = /\$([^$\n]+)\$/g;
const INLINE_MATH_PAREN = /\\\(([^)]+)\\\)/g;

function renderDisplay(expr: string): string {
  return katex.renderToString(expr.trim(), {
    displayMode: true,
    throwOnError: false,
  });
}

function renderInline(expr: string): string {
  return katex.renderToString(expr.trim(), {
    displayMode: false,
    throwOnError: false,
  });
}

export function renderMarkdownMath(markdown: string): string {
  let result = markdown;
  result = result.replace(DISPLAY_MATH_DOLLAR, (_, expr) => renderDisplay(expr));
  result = result.replace(DISPLAY_MATH_BRACKET, (_, expr) => renderDisplay(expr));
  result = result.replace(INLINE_MATH_DOLLAR, (_, expr) => renderInline(expr));
  result = result.replace(INLINE_MATH_PAREN, (_, expr) => renderInline(expr));
  return result;
}
