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
const formPartial = readFileSync(join(DIR, "_form.html"), "utf8").replace(/^<!--[\s\S]*?-->\n/, "");
const SUBJECT_OPTS = ["국어", "영어", "수학", "사회", "과학", "선택·탐구", "코딩", "검정고시", "한글", "외국어", "학습코칭", "해외캠프/유학"];
// 페이지 본문의 <!--FORM subject="검정고시" grade="1" card="light"--> 를 공통 상담 폼으로 바꾼다.
function injectForm(body, slug) {
  return body.replace(/<!--FORM([^>]*)-->/g, (m, attrs) => {
    const get = (k) => { const mm = attrs.match(new RegExp(k + '="([^"]*)"')); return mm ? mm[1] : ""; };
    const subject = get("subject"), grade = get("grade") === "1", card = get("card") === "light" ? "on-light" : "on-blue";
    const P = "f_" + slug.replace(/[^a-z0-9]/g, "") + "_";
    const gradeHtml = grade ? `<div class="field"><label for="${P}grade">학생 학년</label><select id="${P}grade" name="grade"><option value="">선택해주세요</option><optgroup label="초등"><option>초1</option><option>초2</option><option>초3</option><option>초4</option><option>초5</option><option>초6</option></optgroup><optgroup label="중등"><option>중1</option><option>중2</option><option>중3</option></optgroup><optgroup label="고등"><option>고1</option><option>고2</option><option>고3</option><option>재수·N수</option></optgroup><optgroup label="기타"><option>성인</option></optgroup></select></div>` : "";
    // 페이지 과목을 체크박스 항목에 맞춘다 (예: "성인 영어회화" → 외국어, "코딩수업" → 코딩)
    const pick = (s) => s === subject || (s === "외국어" && /영어|일본어|중국어|외국어|JLPT|HSK|토익|아이엘츠|파닉스|면접/.test(subject)) || (s === "코딩" && /코딩/.test(subject)) || (s === "한글" && /한글/.test(subject)) || (s === "검정고시" && /검정고시/.test(subject));
    const subjects = SUBJECT_OPTS.map((s) => `<label><input type="checkbox" name="subject" value="${s}"${pick(s) ? " checked" : ""}>${s}</label>`).join("");
    return formPartial.replaceAll("{{P}}", P).replace("{{GRADE}}", gradeHtml).replace("{{SUBJECTS}}", subjects).replace("{{CARD}}", card).replace("{{SUBJECT}}", subject);
  });
}


function meta(src, key) {
  const m = src.match(new RegExp("<!--\\s*" + key + ":\\s*([\\s\\S]*?)-->"));
  return m ? m[1].trim() : "";
}

const pages = {};
for (const f of readdirSync(DIR).sort()) {
  if (!f.endsWith(".html") || f === "shell.html" || f.startsWith("_")) continue;
  const src = readFileSync(join(DIR, f), "utf8");
  const path = meta(src, "path");
  if (!path) throw new Error(f + ": <!-- path: /... --> 가 없습니다");
  const title = meta(src, "title") || "레벨업과외";
  const desc = meta(src, "desc");
  const head = meta(src, "head");
  const css = meta(src, "css");
  const body = injectForm(src.replace(/<!--\s*(title|desc|path|head|css):[\s\S]*?-->\n?/g, ""), path === "/" ? "home" : path.slice(1));
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
