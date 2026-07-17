import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const captureRoot = "D:/CodeX/work/reward-me-website-migration";
const publicSource = path.join(
  captureRoot,
  "public-source",
  "www.reward-me.ch",
);

const routes = [
  { key: "home", path: "/" },
  { key: "kontakt", path: "/kontakt" },
  { key: "ueber-uns", path: "/ueber-uns" },
  { key: "partner", path: "/partner" },
  { key: "rewards", path: "/rewards" },
  { key: "agb", path: "/agb" },
  { key: "datenschutz", path: "/datenschutz" },
  { key: "impressum", path: "/impressum" },
];

const locales = ["de", "en", "fr", "it"];

function sanitize(markup) {
  return markup
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
}

await mkdir(path.join(projectRoot, "public", "fonts"), { recursive: true });
await mkdir(path.join(projectRoot, "src"), { recursive: true });

const templates = {};
const pageMeta = {};

for (const route of routes) {
  templates[route.key] = {};
  pageMeta[route.key] = {};

  for (const locale of locales) {
    const htmlPath = path.join(
      captureRoot,
      `rendered-${route.key}-${locale}.html`,
    );
    const metaPath = path.join(
      captureRoot,
      `rendered-${route.key}-${locale}.json`,
    );
    templates[route.key][locale] = sanitize(
      await readFile(htmlPath, "utf8"),
    );
    pageMeta[route.key][locale] = JSON.parse(
      await readFile(metaPath, "utf8"),
    );
  }
}

const generated = `// Generated from the rendered Reward Me source capture.\nexport const routes = ${JSON.stringify(routes, null, 2)};\n\nexport const templates = ${JSON.stringify(templates)};\n\nexport const pageMeta = ${JSON.stringify(pageMeta, null, 2)};\n`;

await writeFile(path.join(projectRoot, "src", "templates.js"), generated);
await copyFile(
  path.join(publicSource, "_next", "static", "chunks", "2vxs0cc7ogmb5.css"),
  path.join(projectRoot, "src", "source.css"),
);
await copyFile(
  path.join(publicSource, "logo-mark.png"),
  path.join(projectRoot, "public", "logo-mark.png"),
);
await copyFile(
  path.join(publicSource, "favicon.ico"),
  path.join(projectRoot, "public", "favicon.ico"),
);

console.log(
  JSON.stringify({
    routes: routes.length,
    locales: locales.length,
    templateFile: path.join(projectRoot, "src", "templates.js"),
  }),
);
