import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeImportedMarkup } from "../scripts/html-import-safety.mjs";

test("keeps legitimate static markup and applies the existing capture cleanup", () => {
  const markup = [
    '<div hidden=""><!--$--><!--/$--></div>',
    '<main class="content" style="background:radial-gradient(circle, #fff, transparent)">',
    '<a href="/kontakt">Kontakt</a>',
    '<img src="/_next/image?url=%2Flogo-mark.png&amp;w=640&amp;q=75" srcset="ignored" sizes="40px" data-nimg="1" alt="">',
    "</main>",
    '<script>self.__next_f = []</script>',
    '<next-route-announcer>route</next-route-announcer>',
  ].join("");

  assert.equal(
    sanitizeImportedMarkup(markup, "safe-control"),
    '<main class="content" style="background:radial-gradient(circle, #fff, transparent)"><a href="/kontakt">Kontakt</a><img src="/logo-mark.png" alt=""></main>',
  );
});

for (const [name, markup] of [
  ["event handler", '<img src="/logo.png" onerror="alert(1)">'],
  ["mixed-case event handler", '<svg ONLOAD="alert(1)"></svg>'],
  ["slash-separated event handler", '<svg/onload="alert(1)"></svg>'],
  ["srcdoc", '<div srcdoc="<p>active</p>"></div>'],
  ["iframe", '<iframe src="/internal"></iframe>'],
  ["object", '<object data="/payload"></object>'],
  ["embed", '<embed src="/payload">'],
  ["style element", "<style>body{display:none}</style>"],
  ["meta refresh", '<meta http-equiv="refresh" content="0;url=/other">'],
  ["foreignObject", '<svg><foreignObject><p>html</p></foreignObject></svg>'],
  ["self-closing script", '<script src="/payload"/>'],
]) {
  test(`rejects ${name}`, () => {
    assert.throws(
      () => sanitizeImportedMarkup(markup, `probe-${name}`),
      /Unsafe HTML import rejected \(probe-/,
    );
  });
}

for (const [name, markup] of [
  ["javascript URL", '<a href="javascript:alert(1)">x</a>'],
  ["encoded javascript URL", '<a href="java&#x73;cript:alert(1)">x</a>'],
  ["named-entity javascript URL", '<a href="javascript&colon;alert(1)">x</a>'],
  ["slash-separated javascript URL", '<a/href="javascript:alert(1)">x</a>'],
  ["whitespace-obfuscated URL", '<a href="java\nscript:alert(1)">x</a>'],
  ["vbscript URL", '<a href="vbscript:msgbox(1)">x</a>'],
  ["data URL", '<a href="data:text/html,<script>alert(1)</script>">x</a>'],
  ["SVG script URL", '<svg><a xlink:href="javascript:alert(1)">x</a></svg>'],
  ["form action", '<button formaction="javascript:alert(1)">x</button>'],
]) {
  test(`rejects ${name}`, () => {
    assert.throws(
      () => sanitizeImportedMarkup(markup, `probe-${name}`),
      /unsafe URL protocol/,
    );
  });
}

test("rejects active inline style values", () => {
  assert.throws(
    () =>
      sanitizeImportedMarkup(
        '<div style="background:url(javascript:alert(1))"></div>',
        "probe-style",
      ),
    /unsafe inline style/,
  );
});

test("does not include the rejected payload in the error message", () => {
  const secretMarker = "do-not-log-this-payload";
  assert.throws(
    () =>
      sanitizeImportedMarkup(
        `<img src="/logo.png" onerror="${secretMarker}">`,
        "redacted-probe",
      ),
    (error) => {
      assert.match(error.message, /active attribute/);
      assert.doesNotMatch(error.message, new RegExp(secretMarker));
      return true;
    },
  );
});
