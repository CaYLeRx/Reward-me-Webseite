const ACTIVE_ELEMENT_PATTERN =
  /<\s*\/?\s*(?:script|style|iframe|frame|frameset|object|embed|applet|base|meta|link|foreignobject|annotation-xml)\b/i;

const ACTIVE_ATTRIBUTE_PATTERN = /(?:\s|\/)(?:on[a-z0-9_-]+|srcdoc)\s*=/i;

const URL_ATTRIBUTE_PATTERN =
  /(?:\s|\/)(?:href|src|xlink:href|action|formaction|poster|background)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;

const STYLE_ATTRIBUTE_PATTERN = /(?:\s|\/)style\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;

function decodeBrowserEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#([0-9]+);?/g, (_, decimal) =>
      String.fromCodePoint(Number.parseInt(decimal, 10)),
    )
    .replace(/&colon;?/gi, ":")
    .replace(/&(tab|newline);?/gi, " ");
}

function normalizeProtocol(value) {
  return decodeBrowserEntities(value)
    .replace(/[\u0000-\u0020\u007f-\u009f]/g, "")
    .toLowerCase();
}

function assertSafeImportedMarkup(markup, sourceLabel) {
  if (ACTIVE_ELEMENT_PATTERN.test(markup)) {
    throw new Error(`Unsafe HTML import rejected (${sourceLabel}): active element`);
  }

  if (ACTIVE_ATTRIBUTE_PATTERN.test(markup)) {
    throw new Error(`Unsafe HTML import rejected (${sourceLabel}): active attribute`);
  }

  URL_ATTRIBUTE_PATTERN.lastIndex = 0;
  for (const match of markup.matchAll(URL_ATTRIBUTE_PATTERN)) {
    const value = match[1] ?? match[2] ?? match[3] ?? "";
    if (/^(?:javascript|vbscript|data):/.test(normalizeProtocol(value))) {
      throw new Error(`Unsafe HTML import rejected (${sourceLabel}): unsafe URL protocol`);
    }
  }

  STYLE_ATTRIBUTE_PATTERN.lastIndex = 0;
  for (const match of markup.matchAll(STYLE_ATTRIBUTE_PATTERN)) {
    const value = normalizeProtocol(match[1] ?? match[2] ?? "");
    if (/expression\(|(?:javascript|vbscript|data):/.test(value)) {
      throw new Error(`Unsafe HTML import rejected (${sourceLabel}): unsafe inline style`);
    }
  }
}

export function sanitizeImportedMarkup(markup, sourceLabel = "unknown source") {
  const sanitized = markup
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<next-route-announcer\b[^>]*>[\s\S]*?<\/next-route-announcer>/gi, "")
    .replace(/<nextjs-portal\b[^>]*>[\s\S]*?<\/nextjs-portal>/gi, "")
    .replace(/^<div hidden=""><!--\$--><!--\/\$--><\/div>/, "")
    .replace(/\s+srcset="[^"]*"/gi, "")
    .replace(/\s+sizes="[^"]*"/gi, "")
    .replace(/\s+data-nimg="[^"]*"/gi, "")
    .replace(
      /src="\/_next\/image\?url=%2Flogo-mark\.png(?:&amp;|&)w=\d+(?:&amp;|&)q=\d+"/gi,
      'src="/logo-mark.png"',
    );

  assertSafeImportedMarkup(sanitized, sourceLabel);
  return sanitized;
}
