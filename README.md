# 레벨업과외 — Cloudflare Worker

초·중·고 전과목 1:1 과외 홈페이지.
요청마다 페이지를 동적으로 생성하고, 상담 신청(`/api/inquiry`)을 처리하는 Cloudflare Worker입니다.

## 구성
- `레벨업과외_worker.js` — 워커 본체 (사이트 HTML + 로고·파비콘 + 상담 API 전부 포함)
- `wrangler.toml` — 배포 설정 (`main = 레벨업과외_worker.js`, `name = level-up-lesson`)
- `.github/workflows/deploy.yml` — `main`에 push하면 자동 배포 (GitHub Actions)
- `.gitignore`

## 배포 (GitHub Actions 자동 배포)
1. 이 파일들을 GitHub 저장소에 올립니다.
2. 저장소 → **Settings → Secrets and variables → Actions → New repository secret** 에서
   **`CLOUDFLARE_API_TOKEN`** 을 추가합니다.
   (토큰: Cloudflare → My Profile → API Tokens → "Edit Cloudflare Workers" 템플릿으로 생성)
3. `main` 브랜치에 push하면 Actions가 자동으로 `wrangler deploy`를 실행합니다.
   **Actions** 탭에서 결과를 확인하고 `*.workers.dev` 주소로 접속해 봅니다.

> 배포 시 account id 관련 에러가 나면, `CLOUDFLARE_ACCOUNT_ID` 시크릿도 추가하고
> `deploy.yml`의 `accountId` 줄 주석을 해제하세요.

## (선택) 로컬에서 직접 배포
```bash
npx wrangler deploy
```

## 커스텀 도메인(level-up-lesson.com) 연결
도메인이 이미 Cloudflare에 있으므로, 워커 → **Settings → Domains & Routes → Add → Custom Domain**
에서 `level-up-lesson.com` 을 추가하면 DNS·SSL이 자동으로 설정됩니다.

## 상담 신청 저장 / 알림 연결
`레벨업과외_worker.js`의 `handleInquiry` 함수 안 주석을 참고하세요 (KV 저장 또는 디스코드/슬랙/텔레그램 웹훅).
