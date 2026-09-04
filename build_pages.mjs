// 페이지 빌드 스크립트
//   src/pages/shell.html  : 모든 페이지가 공유하는 뼈대 (헤더·메뉴·CSS·플로팅 버튼·스크립트)
//   src/pages/*.html      : 페이지별 본문. 맨 위 주석으로 제목·설명·경로를 적는다.
//       <!-- title: 페이지 제목 -->
//       <!-- desc: 검색 결과에 보일 설명 -->
//       <!-- path: /coaching -->
//       <!-- head: ... 추가 <head> 태그 (선택) ... -->
//       <!-- css: ... 페이지 전용 CSS (선택) ... -->
//   실행:  node build_pages.mjs   →  site_pages.js 가 다시 만들어진다 (이 파일을 커밋)
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "src/pages";
const BASE = "https://level-up-lesson.com";
const shell = readFileSync(join(DIR, "shell.html"), "utf8");

function meta(src, key) {
  const m = src.match(new RegExp("<!--\\s*" + key + ":\\s*([\\s\\S]*?)-->"));
  return m ? m[1].trim() : "";
}

const pages = {};
for (const f of readdirSync(DIR).sort()) {
  if (!f.endsWith(".html") || f === "shell.html") continue;
  const src = readFileSync(join(DIR, f), "utf8");
  const path = meta(src, "path");
  if (!path) throw new Error(f + ": <!-- path: /... --> 가 없습니다");
  const title = meta(src, "title") || "레벨업과외";
  const desc = meta(src, "desc");
  const head = meta(src, "head");
  const css = meta(src, "css");
  const body = src.replace(/<!--\s*(title|desc|path|head|css):[\s\S]*?-->\n?/g, "");
  const html = shell
    .replaceAll("{{TITLE}}", title)
    .replaceAll("{{DESC}}", desc)
    .replaceAll("{{CANONICAL}}", path === "/" ? BASE + "/" : BASE + path)
    .replace("{{EXTRA_HEAD}}", head)
    .replace("{{EXTRA_CSS}}", css ? "<style>\n" + css + "\n</style>" : "")
    .replace("{{BODY_CLASS}}", path === "/" ? "page-home" : "page-sub")
    .replace("{{MAIN}}", body);
  pages[path] = { title, html };
  console.log("built", path, "←", f, "(" + html.length + " chars)");
}

const out =
  "// 자동 생성 파일 — 직접 고치지 말고 src/pages/*.html 을 수정한 뒤 `node build_pages.mjs` 를 실행하세요.\n" +
  "// {{YEAR}} {{VERIFY}} {{ANTICOPY}} 는 워커가 응답 시점에 채웁니다.\n" +
  "export const PAGES = " + JSON.stringify(pages, null, 0) + ";\n" +
  "export const PAGE_PATHS = Object.keys(PAGES);\n";
writeFileSync("site_pages.js", out);
console.log("site_pages.js written:", Object.keys(pages).join(", "));
