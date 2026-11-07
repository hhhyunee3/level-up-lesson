// 사이트 공통 푸터 — 사업자 정보 (2026-11-08, 네이버 검색광고 비즈채널 검수 보완).
// 한 곳에서만 고친다:
//   · 홈·하위 페이지(src/pages/*.html) → build_pages.mjs 가 shell.html 의 {{FOOTER}} 자리에 넣는다 (site_pages.js 다시 빌드)
//   · 지역·학교·가이드 등 자동 생성 페이지 → seo_pages.js 가 응답 때 siteFooter() 를 부른다
// 전화번호는 telguard.js 가 <footer class="site-footer"> 안은 지우지 않고, a.biz-tel 은 PC 에서도 보이게 둔다.
// 사업자등록번호·교습자 신고번호는 없으므로 넣지 않는다. 이용약관·수업료 안내 링크는 페이지가 생긴 뒤 넣는다.

export const BIZ = {
  name: "레벨업과외",
  owner: "김지현",
  address: "서울특별시 금천구 디지털로 178",
  tel: "010-3038-8978",
  email: "hhhyunee3@naver.com",
};

export const FOOTER_CSS = `<style id="site-footer-css">
.site-footer{background:#f5f6f8;color:#555;font-size:13px;line-height:1.7;padding:32px 16px;margin-top:48px;border-top:1px solid #e5e8ec;text-align:left;font-family:inherit}
.site-footer .footer-inner{max-width:1080px;margin:0 auto}
.site-footer p{margin:0 0 6px}
.site-footer .footer-brand{font-weight:700;color:#222;font-size:15px;margin-bottom:8px}
.site-footer a{color:#555;text-decoration:underline}
.site-footer a.biz-tel{display:inline!important}
.site-footer .footer-links{margin-top:10px}
.site-footer .footer-links a{margin-right:4px}
.site-footer .footer-links strong{color:#222}
.site-footer .footer-copy{color:#999;margin-top:12px}
</style>`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// opts.year    연도 문자열 (홈·하위 페이지는 "{{YEAR}}" 를 넘겨 워커가 응답 때 채운다)
// opts.note    푸터 첫 줄 뒤에 붙일 짧은 설명 (예: "서울 강남구 수학 과외")
// opts.updated 최종 업데이트 표시 (예: "2026년 11월 8일") — 자동 생성 페이지만
export function siteFooter(opts = {}) {
  const year = opts.year || new Date().getFullYear();
  const note = opts.note ? " · " + esc(opts.note) : "";
  const updated = opts.updated ? '<p class="footer-updated">최종 업데이트 ' + esc(opts.updated) + "</p>" : "";
  return FOOTER_CSS + `
<footer class="site-footer">
  <div class="footer-inner">
    <p class="footer-brand">${esc(BIZ.name)}${note}</p>
    <p>
      상호: ${esc(BIZ.name)} | 대표: ${esc(BIZ.owner)}<br>
      주소: ${esc(BIZ.address)}<br>
      전화: <a class="biz-tel" href="tel:${BIZ.tel}">${BIZ.tel}</a> | 이메일: <a href="mailto:${BIZ.email}">${BIZ.email}</a>
    </p>
    <p class="footer-links">
      <a href="/privacy"><strong>개인정보처리방침</strong></a> · <a href="/guides">학습 가이드</a> · <a href="/tools">무료 도구</a> · <a href="/regions">전국 지역</a> · <a href="/schools">학교별 과외</a>
    </p>
    ${updated}
    <p class="footer-copy">© ${year} ${esc(BIZ.name)}. All rights reserved.</p>
  </div>
</footer>`;
}
