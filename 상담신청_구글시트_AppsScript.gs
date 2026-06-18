/**
 * 레벨업과외 — 상담 신청을 구글 시트에 자동 기록하는 스크립트
 * =====================================================================
 * 설치 방법
 *  1) 구글 드라이브에서 새 구글 시트를 하나 만든다. (예: "레벨업과외 상담신청")
 *  2) 시트 상단 메뉴 [확장 프로그램] → [Apps Script] 클릭.
 *  3) 기본 코드를 모두 지우고, 이 파일 내용을 통째로 붙여넣는다.
 *  4) 저장(💾) → 오른쪽 위 [배포] → [새 배포].
 *      · 유형(톱니바퀴) → "웹 앱"
 *      · 실행 계정: 나
 *      · 액세스 권한: "모든 사용자"
 *      · [배포] → 본인 구글 계정으로 권한 승인.
 *  5) 표시되는 "웹 앱 URL"( https://script.google.com/macros/s/..../exec )을 복사.
 *  6) Cloudflare 워커 → Settings → Variables and Secrets 에
 *      변수  SHEET_WEBHOOK_URL = (복사한 URL)  추가 후 저장.
 *
 * 이후 홈페이지에서 상담 신청이 들어올 때마다 시트에 한 줄씩 자동으로 쌓인다.
 * =====================================================================
 */

var SHEET_NAME = '상담신청';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // 첫 기록이면 헤더 추가 + 연락처 열을 텍스트로(앞자리 0 보존)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['접수시각', '학생이름', '학부모연락처', '학년', '희망과목', '주소', '문의내용']);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
      sheet.setFrozenRows(1);
      sheet.getRange('C:C').setNumberFormat('@'); // 연락처 = 텍스트
    }

    var subjects = Array.isArray(data.subjects) ? data.subjects.join(', ') : (data.subjects || '');
    sheet.appendRow([
      data.atDisplay || new Date(),
      data.name || '',
      data.phone || '',
      data.grade || '',
      subjects,
      data.address || '',
      data.message || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 브라우저로 URL을 열었을 때 작동 확인용(선택)
function doGet() {
  return ContentService
    .createTextOutput('레벨업과외 상담신청 수집기 작동 중')
    .setMimeType(ContentService.MimeType.TEXT);
}
