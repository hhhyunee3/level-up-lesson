// 레벨업과외 — Cloudflare Worker
// 요청마다 페이지를 동적으로 생성·서빙하고, 상담 신청(/api/inquiry)을 처리합니다.
// 배포:  npx wrangler deploy   (자세한 내용은 README.md / wrangler.toml 참고)

// 상담 신청 시 이메일 알림 발송용 (Cloudflare Email Routing)
import { EmailMessage } from "cloudflare:email";
import { tryRenderSeoPage, seoSitemapPaths } from "./seo_pages.js";

const HTML = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>레벨업과외 · 초·중·고 전과목 1:1 과외</title>
<meta name="description" content="국어·영어·수학·사회·과학, 고등 선택·탐구과목까지. 학생의 현재 레벨에서 시작하는 초·중·고 1:1 맞춤 과외." />
<link rel="canonical" href="https://level-up-lesson.com/" />
<meta property="og:type" content="website" />
<meta property="og:title" content="레벨업과외 · 초·중·고 전과목 1:1 과외" />
<meta property="og:description" content="국어·영어·수학·사회·과학, 고등 선택·탐구과목까지. 학생의 현재 레벨에서 시작하는 1:1 맞춤 과외." />
<meta property="og:url" content="https://level-up-lesson.com/" />
<meta property="og:locale" content="ko_KR" />
{{VERIFY}}
\g<1>data:image/png;base64,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\g<2> />
<link rel="icon" href="favicon.ico" sizes="any" />
<link rel="apple-touch-icon" href="apple-touch-icon.png" />

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap" />
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />

<style>
  :root{
    /* ── 하늘색 팔레트 ── */
    --sky:#33C2F2;          /* 시그니처 밝은 하늘색 (로고색) */
    --sky-2:#16A9E8;        /* 진한 하늘색 (그라데이션 하단) */
    --sky-deep:#0C7CB8;     /* 딥 시안블루 (아이콘/소제목 강조) */
    --sky-pale:#E8F6FE;     /* 페이지 배경 (에어리한 연하늘) */
    --sky-tint:#D2EEFC;     /* 카드 틴트 */
    --sky-edge:#D6ECFA;     /* 연한 테두리 */
    --ink:#0E3550;          /* 딥 네이비블루 (제목/본문) */
    --body-ink:#2E5269;     /* 본문 톤 */
    --muted:#5E7E92;        /* 보조 텍스트 */
    --white:#FFFFFF;
    --sun:#FFCE3A;          /* 햇살 옐로 (별·포인트 아주 살짝) */
    --navy:#0B2C44;         /* 푸터 등 딥 네이비 */

    /* 볼륨감 그림자 (하늘색 톤) */
    --sh-soft:0 16px 36px -16px rgba(16,120,200,.30);
    --sh-card:0 20px 44px -18px rgba(16,120,200,.32), inset 0 2px 0 rgba(255,255,255,.9);
    --sh-lg:0 36px 70px -24px rgba(12,100,175,.40);
    --gloss:inset 0 2px 0 rgba(255,255,255,.7);

    --maxw:1120px;
    --display:"Fredoka","Pretendard",system-ui,sans-serif;
    --font:"Pretendard",system-ui,-apple-system,"Apple SD Gothic Neo",sans-serif;
  }

  *{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{
    margin:0; color:var(--ink); font-family:var(--font); font-size:17px; line-height:1.65;
    -webkit-font-smoothing:antialiased; word-break:keep-all; overflow-x:hidden;
    background:
      radial-gradient(1100px 600px at 88% -8%, #D2F0FE 0%, rgba(210,240,254,0) 60%),
      radial-gradient(900px 520px at -8% 12%, #E2F4FE 0%, rgba(226,244,254,0) 55%),
      var(--sky-pale);
  }
  a{color:inherit; text-decoration:none;}
  img{max-width:100%; display:block;}
  .wrap{max-width:var(--maxw); margin:0 auto; padding:0 24px; position:relative;}
  :focus-visible{outline:3px solid var(--sky-2); outline-offset:3px; border-radius:8px;}

  .eyebrow{
    font-family:var(--display); font-weight:600; letter-spacing:.06em; font-size:13.5px;
    color:var(--sky-deep); display:inline-flex; align-items:center; gap:9px;
  }
  .eyebrow::before{content:""; width:20px; height:3px; border-radius:3px; background:var(--sky); display:inline-block;}

  /* ── 버튼 (부풀어오른 글로시) ── */
  .btn{
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    font-family:var(--font); font-weight:700; font-size:16px; padding:15px 28px;
    border-radius:999px; border:none; cursor:pointer; white-space:nowrap;
    transition:transform .16s ease, box-shadow .16s ease;
  }
  .btn-primary{
    color:#fff; background:linear-gradient(180deg,#54D2F8 0%,#26B6EE 52%,#15A2E0 100%);
    box-shadow:0 12px 24px -6px rgba(18,150,214,.55), inset 0 2px 0 rgba(255,255,255,.65), inset 0 -3px 7px rgba(8,90,140,.28);
  }
  .btn-primary:hover{transform:translateY(-2px); box-shadow:0 18px 30px -8px rgba(18,150,214,.6), inset 0 2px 0 rgba(255,255,255,.65), inset 0 -3px 7px rgba(8,90,140,.28);}
  .btn-primary:active{transform:translateY(1px); box-shadow:0 7px 15px -6px rgba(18,150,214,.5), inset 0 2px 0 rgba(255,255,255,.5), inset 0 -2px 5px rgba(8,90,140,.32);}
  .btn-soft{
    color:var(--sky-deep); background:linear-gradient(180deg,#FFFFFF 0%,#EAF6FD 100%);
    box-shadow:0 10px 22px -10px rgba(16,120,200,.4), var(--gloss); border:1px solid var(--sky-edge);
  }
  .btn-soft:hover{transform:translateY(-2px); box-shadow:0 16px 26px -10px rgba(16,120,200,.45), var(--gloss);}

  /* ── 헤더 ── */
  header{position:sticky; top:0; z-index:60; transition:background .2s ease, box-shadow .2s ease;}
  header.scrolled{background:rgba(232,246,254,.78); backdrop-filter:saturate(180%) blur(14px); box-shadow:0 6px 24px -16px rgba(16,120,200,.5);}
  .nav{display:flex; align-items:center; justify-content:space-between; height:76px;}
  .brand{font-family:var(--font); font-weight:800; font-size:21px; letter-spacing:-.01em; color:var(--ink); display:flex; align-items:center; gap:11px;}
  .brand .mark{
    height:36px; flex:none; display:flex; align-items:center; overflow:visible;
    background:transparent; box-shadow:none;
  }
  .brand .mark img{height:36px; width:auto; object-fit:contain; display:block;}
  .nav-links{display:flex; align-items:center; gap:34px; list-style:none; margin:0; padding:0;}
  .nav-links a{font-size:15.5px; font-weight:600; color:var(--body-ink); transition:color .15s ease;}
  .nav-links a:hover{color:var(--sky-deep);}
  .nav-cta{display:flex; align-items:center; gap:14px;}
  .nav-cta .btn{padding:11px 22px; font-size:15px;}
  .hamburger{display:none; width:46px; height:46px; border:1px solid var(--sky-edge); border-radius:14px; background:#fff; cursor:pointer; position:relative; box-shadow:var(--sh-soft);}
  .hamburger span,.hamburger span::before,.hamburger span::after{
    content:""; position:absolute; left:50%; top:50%; width:18px; height:2.5px; border-radius:3px; background:var(--ink);
    transform:translate(-50%,-50%); transition:.2s;
  }
  .hamburger span::before{transform:translate(-50%,-7px);}
  .hamburger span::after{transform:translate(-50%,5px);}

  /* ── 떠다니는 풍선(장식) ── */
  .balloon{
    position:absolute; border-radius:50%; pointer-events:none; z-index:0;
    background:radial-gradient(circle at 32% 26%, #DFF6FF 0%, #6FD4F7 32%, #2BB8EE 70%, #1AA3E1 100%);
    box-shadow:0 18px 30px -12px rgba(20,140,210,.45), inset -6px -8px 14px rgba(10,100,160,.35), inset 5px 6px 10px rgba(255,255,255,.5);
  }
  .balloon.y{background:radial-gradient(circle at 32% 26%, #FFF4CE 0%, #FFE07A 34%, #FFCE3A 72%, #F4BC1F 100%); box-shadow:0 18px 30px -12px rgba(220,170,20,.4), inset -6px -8px 14px rgba(190,140,10,.3), inset 5px 6px 10px rgba(255,255,255,.55);}

  /* ── 히어로 ── */
  .hero{padding:78px 0 92px; position:relative;}
  .hero .balloon.b-a{width:120px; height:120px; top:6%; right:3%;}
  .hero .balloon.b-b{width:64px; height:64px; bottom:8%; left:1%;}
  .hero-grid{display:grid; grid-template-columns:1.04fr .96fr; gap:54px; align-items:center; position:relative; z-index:2;}
  .pill-tag{
    display:inline-flex; align-items:center; gap:8px; background:#fff; color:var(--sky-deep);
    font-weight:700; font-size:14px; padding:8px 16px; border-radius:999px; box-shadow:var(--sh-soft), var(--gloss); border:1px solid var(--sky-edge);
  }
  .pill-tag .dot{width:8px; height:8px; border-radius:50%; background:var(--sky); box-shadow:0 0 0 4px rgba(51,194,242,.25);}
  .hero h1{
    font-family:var(--font); font-weight:800; font-size:clamp(36px,5.2vw,60px); line-height:1.12;
    letter-spacing:-.02em; margin:20px 0 20px;
  }
  .hero h1 .pop{
    background:linear-gradient(180deg,#46CBF6,#13A0DF); -webkit-background-clip:text; background-clip:text; color:transparent;
    white-space:nowrap;
  }
  .hero p.lead{font-size:18px; color:var(--body-ink); max-width:30em; margin:0 0 32px;}
  .hero-cta{display:flex; gap:14px; flex-wrap:wrap;}
  .hero-meta{display:flex; gap:14px; margin-top:38px; flex-wrap:wrap;}
  .hero-meta .stat{
    background:#fff; border:1px solid var(--sky-edge); border-radius:18px; padding:16px 20px;
    box-shadow:var(--sh-card); min-width:128px;
  }
  .hero-meta .num{font-family:var(--display); font-weight:700; font-size:25px; line-height:1; color:var(--sky-deep);}
  .hero-meta .lbl{font-size:13px; color:var(--muted); margin-top:7px;}

  /* 시그니처: 부풀며 쌓이는 레벨 */
  .levelup{
    position:relative; background:linear-gradient(180deg,#FFFFFF 0%,#F2FAFE 100%);
    border:1px solid var(--sky-edge); border-radius:30px; padding:30px 32px 26px; box-shadow:var(--sh-lg), var(--gloss); overflow:hidden;
  }
  .levelup .balloon.lb1{width:46px; height:46px; top:24px; left:30px;}
  .levelup .balloon.lb2{width:30px; height:30px; top:64px; right:42px;}
  .lu-head{display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; position:relative; z-index:2;}
  .lu-head .t{font-family:var(--display); font-size:12.5px; font-weight:600; letter-spacing:.08em; color:var(--muted); text-transform:uppercase;}
  .lu-head .m{font-family:var(--display); font-weight:700; color:var(--sky-deep); font-size:14px;}
  .lu-stage{position:relative; height:236px; display:flex; align-items:flex-end; justify-content:center; gap:20px; padding-top:30px;}
  .lu-block{
    width:84px; border-radius:22px 22px 16px 16px; display:flex; flex-direction:column; justify-content:flex-end;
    align-items:center; padding-bottom:14px; color:#fff; position:relative; transform-origin:bottom; transform:scaleY(0);
    box-shadow:0 16px 26px -12px rgba(16,120,200,.5), inset 0 3px 0 rgba(255,255,255,.55), inset 0 -6px 12px rgba(8,80,130,.28);
    animation:grow .85s cubic-bezier(.2,.85,.25,1) forwards;
  }
  .lu-block .lv{font-family:var(--display); font-weight:600; font-size:11px; letter-spacing:.05em; opacity:.85;}
  .lu-block .g{font-family:var(--font); font-weight:800; font-size:22px; line-height:1; margin-top:2px;}
  .lu-block.b1{height:46%; background:linear-gradient(180deg,#8CDCF8,#52C6F2); animation-delay:.15s;}
  .lu-block.b2{height:68%; background:linear-gradient(180deg,#4FCAF5,#1FAEE9); animation-delay:.32s;}
  .lu-block.b3{height:94%; background:linear-gradient(180deg,#27ADE8,#0E83C6); animation-delay:.49s;}
  .lu-topper{
    position:absolute; top:-34px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:4px;
    opacity:0; animation:pop .5s ease 1.05s forwards;
  }
  .lu-topper .star{width:26px; height:26px; border-radius:50%; display:grid; place-items:center; color:#fff;
    background:radial-gradient(circle at 34% 28%, #FFF1C6, #FFD64D 55%, #F6BE21); box-shadow:0 6px 12px -4px rgba(220,170,20,.6), inset 0 1px 1px rgba(255,255,255,.7); font-size:14px;}
  .lu-topper .lbl{font-family:var(--display); font-weight:700; font-size:11px; color:var(--sky-deep); background:#fff; padding:3px 9px; border-radius:999px; box-shadow:var(--sh-soft); white-space:nowrap;}
  @keyframes grow{to{transform:scaleY(1);}}
  @keyframes pop{to{opacity:1; transform:translateX(-50%) translateY(0);}}
  @keyframes bob{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}

  /* ── 섹션 공통 ── */
  .section{padding:88px 0; position:relative;}
  .section-head{max-width:660px; margin-bottom:50px;}
  .section-head h2{font-family:var(--font); font-weight:800; font-size:clamp(28px,3.7vw,42px); line-height:1.18; letter-spacing:-.02em; margin:14px 0 14px;}
  .section-head p{color:var(--body-ink); font-size:17px; margin:0;}
  .center{margin-left:auto; margin-right:auto; text-align:center;}
  .center .eyebrow{justify-content:center;}
  .panel-white{background:linear-gradient(180deg,#FFFFFF 0%,#FBFDFF 100%);}

  /* ── 강점 ── */
  .strengths{display:grid; grid-template-columns:repeat(4,1fr); gap:20px;}
  .scard{
    background:linear-gradient(180deg,#FFFFFF,#F4FBFF); border:1px solid var(--sky-edge); border-radius:24px;
    padding:30px 26px; box-shadow:var(--sh-card); transition:transform .2s ease, box-shadow .2s ease;
  }
  .scard:hover{transform:translateY(-6px); box-shadow:var(--sh-lg);}
  .scard .ic{
    width:54px; height:54px; border-radius:16px; display:grid; place-items:center; margin-bottom:18px;
    background:linear-gradient(165deg,#7FD7F7,#22B2EC); box-shadow:0 10px 18px -8px rgba(18,150,214,.6), inset 0 2px 0 rgba(255,255,255,.5), inset 0 -3px 6px rgba(8,90,140,.3);
  }
  .scard .ic svg{width:26px; height:26px; stroke:#fff;}
  .scard h3{font-size:18.5px; font-weight:800; margin:0 0 9px; letter-spacing:-.01em; color:var(--ink);}
  .scard p{font-size:14.5px; color:var(--muted); margin:0; line-height:1.6;}

  /* ── 과목(레벨 티어) ── */
  .tiers{display:flex; flex-direction:column; gap:22px;}
  .tier{
    display:grid; grid-template-columns:210px 1fr; gap:34px; align-items:center;
    border-radius:28px; padding:34px 36px; position:relative; transition:transform .2s ease, box-shadow .2s ease;
    background:linear-gradient(180deg,#FFFFFF,#F4FBFF); border:1px solid var(--sky-edge); box-shadow:var(--sh-card);
  }
  .tier:hover{transform:translateY(-4px); box-shadow:var(--sh-lg);}
  .tier .badge{display:flex; flex-direction:column; gap:10px;}
  .tier .lvchip{
    align-self:flex-start; font-family:var(--display); font-weight:700; font-size:13px; letter-spacing:.04em;
    color:#fff; padding:7px 15px; border-radius:999px;
    box-shadow:0 8px 16px -7px rgba(18,150,214,.55), inset 0 2px 0 rgba(255,255,255,.5);
  }
  .tier .grade{font-family:var(--font); font-weight:800; font-size:32px; letter-spacing:-.02em; line-height:1; color:var(--ink);}
  .tier .desc{font-size:14px; color:var(--muted);}
  .chips{display:flex; flex-wrap:wrap; gap:10px;}
  .chip{
    font-size:14.5px; font-weight:600; padding:9px 16px; border-radius:999px; color:var(--ink);
    background:linear-gradient(180deg,#FFFFFF,#EAF6FD); border:1px solid var(--sky-edge);
    box-shadow:0 5px 11px -5px rgba(18,150,214,.32), inset 0 1px 0 #fff;
  }
  /* 티어별 강조 */
  .tier.t1 .lvchip{background:linear-gradient(180deg,#8CDCF8,#52C6F2);}
  .tier.t2 .lvchip{background:linear-gradient(180deg,#4FCAF5,#1FAEE9);}
  .tier.t3{background:linear-gradient(165deg,#1FA6E5 0%,#0C77BA 100%); border-color:transparent; box-shadow:var(--sh-lg);}
  .tier.t3 .grade{color:#fff;} .tier.t3 .desc{color:rgba(255,255,255,.82);}
  .tier.t3 .lvchip{background:rgba(255,255,255,.22); box-shadow:inset 0 1px 0 rgba(255,255,255,.4);}
  .tier.t3 .chip{background:rgba(255,255,255,.14); border-color:rgba(255,255,255,.22); color:#fff; box-shadow:inset 0 1px 0 rgba(255,255,255,.2);}
  .tier.t3 .chip.hl{background:linear-gradient(180deg,#FFE07A,#FFCE3A); border-color:transparent; color:#5A4500; box-shadow:0 6px 12px -5px rgba(220,170,20,.5), inset 0 1px 0 rgba(255,255,255,.5);}a.chip{text-decoration:none;cursor:pointer;transition:transform .12s ease, box-shadow .12s ease;} a.chip:hover{transform:translateY(-2px); box-shadow:0 9px 18px -6px rgba(18,150,214,.5);}
  .grp{margin-bottom:16px;} .grp:last-child{margin-bottom:0;}
  .grp-label{font-size:12.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); margin-bottom:10px;}
  .tier.t3 .grp-label{color:rgba(255,255,255,.65);}

  /* ── 수업 방식(프로세스) ── */
  .steps{display:grid; grid-template-columns:repeat(4,1fr); gap:20px;}
  .step{
    background:linear-gradient(180deg,#FFFFFF,#F4FBFF); border:1px solid var(--sky-edge); border-radius:24px;
    padding:28px 24px; box-shadow:var(--sh-card); transition:transform .2s ease;
  }
  .step:hover{transform:translateY(-5px);}
  .step .no{
    display:inline-grid; place-items:center; width:46px; height:46px; border-radius:14px; margin-bottom:16px;
    font-family:var(--display); font-weight:700; font-size:17px; color:#fff;
    background:linear-gradient(165deg,#54D2F8,#16A9E8); box-shadow:0 10px 18px -8px rgba(18,150,214,.6), inset 0 2px 0 rgba(255,255,255,.5);
  }
  .step h3{font-size:19px; font-weight:800; margin:0 0 10px; letter-spacing:-.01em; color:var(--ink);}
  .step p{font-size:14.5px; color:var(--muted); margin:0; line-height:1.6;}

  /* ── 후기 ── */
  .reviews{display:grid; grid-template-columns:repeat(3,1fr); gap:22px;}
  .review{
    background:linear-gradient(180deg,#FFFFFF,#F4FBFF); border:1px solid var(--sky-edge); border-radius:24px;
    padding:30px 28px; display:flex; flex-direction:column; box-shadow:var(--sh-card);
  }
  .review .stars{color:var(--sun); letter-spacing:2px; font-size:16px; margin-bottom:16px; text-shadow:0 1px 0 rgba(220,170,20,.25);}
  .review .quote{font-size:16.5px; line-height:1.7; margin:0 0 22px; font-weight:500; color:var(--ink);}
  .review .who{display:flex; align-items:center; gap:13px; margin-top:auto;}
  .review .who .av{
    width:44px; height:44px; border-radius:50%; color:#fff; display:grid; place-items:center; font-weight:800; font-size:16px;
    background:linear-gradient(165deg,#54D2F8,#16A9E8); box-shadow:0 8px 14px -6px rgba(18,150,214,.55), inset 0 2px 0 rgba(255,255,255,.4);
  }
  .review .who b{font-size:14.5px; color:var(--ink);} .review .who span{font-size:13px; color:var(--muted); display:block;}

  /* ── 문의(하늘색 패널 + 폼) ── */
  .contact-panel{
    position:relative; overflow:hidden; border-radius:36px; padding:64px 56px; color:#fff;
    background:linear-gradient(155deg,#33C2F2 0%,#1AA4E5 48%,#0C77BA 100%); box-shadow:var(--sh-lg);
  }
  .contact-panel .balloon.cb1{width:120px; height:120px; top:-26px; right:8%; background:radial-gradient(circle at 32% 26%, rgba(255,255,255,.55),rgba(255,255,255,.12) 60%,rgba(255,255,255,0)); box-shadow:none;}
  .contact-panel .balloon.cb2{width:70px; height:70px; bottom:-14px; left:6%; background:radial-gradient(circle at 32% 26%, rgba(255,255,255,.45),rgba(255,255,255,.08) 60%,rgba(255,255,255,0)); box-shadow:none;}
  .contact-grid{display:grid; grid-template-columns:.9fr 1.1fr; gap:50px; align-items:start; position:relative; z-index:2;}
  .contact-aside .eyebrow{color:#fff;} .contact-aside .eyebrow::before{background:#fff;}
  .contact-aside h2{font-family:var(--font); font-weight:800; font-size:clamp(27px,3.5vw,40px); line-height:1.18; letter-spacing:-.02em; margin:14px 0 18px;}
  .contact-aside p{color:rgba(255,255,255,.85); margin:0 0 28px;}
  .contact-quick{display:flex; flex-direction:column; gap:12px;}
  .qrow{display:flex; align-items:center; gap:14px; padding:15px 18px; border-radius:16px; background:rgba(255,255,255,.14); box-shadow:inset 0 1px 0 rgba(255,255,255,.25); transition:background .15s ease, transform .15s ease;}
  .qrow:hover{background:rgba(255,255,255,.22); transform:translateY(-2px);}
  .qrow .qic{width:44px; height:44px; border-radius:13px; background:#fff; display:grid; place-items:center; flex:none; box-shadow:0 6px 12px -6px rgba(0,0,0,.25);}
  .qrow .qic svg{width:21px; height:21px; stroke:var(--sky-2);}
  .qrow .ql{font-size:12px; color:rgba(255,255,255,.75); text-transform:uppercase; letter-spacing:.06em;}
  .qrow .qv{font-weight:700; font-size:16px;}

  .form-card{background:#fff; color:var(--ink); border-radius:26px; padding:34px; box-shadow:0 30px 60px -22px rgba(8,70,120,.5), var(--gloss);}
  .form-row{display:grid; grid-template-columns:1fr 1fr; gap:16px;}
  .field{margin-bottom:18px;} .field.full{grid-column:1/-1;}
  .field label{display:block; font-size:13.5px; font-weight:700; margin-bottom:8px; color:var(--ink);}
  .field label .req{color:var(--sky-2);}
  .field input,.field select,.field textarea{
    width:100%; font-family:var(--font); font-size:15.5px; color:var(--ink); padding:14px 16px;
    border:1.5px solid var(--sky-edge); border-radius:14px; background:#F5FBFF; transition:border-color .15s ease, background .15s ease, box-shadow .15s ease;
  }
  .field input:focus,.field select:focus,.field textarea:focus{outline:none; border-color:var(--sky); background:#fff; box-shadow:0 0 0 4px rgba(51,194,242,.18);}
  .field textarea{resize:vertical; min-height:96px;}
  .subj-pick{display:flex; flex-wrap:wrap; gap:10px;}
  .subj-pick label{display:inline-flex; align-items:center; gap:7px; padding:10px 15px; border:1.5px solid var(--sky-edge); border-radius:999px; font-size:14.5px; font-weight:600; cursor:pointer; user-select:none; transition:.15s; margin:0; background:#F5FBFF;}
  .subj-pick input{position:absolute; opacity:0; width:0; height:0;}
  .subj-pick label:has(input:checked){border-color:transparent; color:#fff; background:linear-gradient(180deg,#54D2F8,#16A9E8); box-shadow:0 8px 14px -6px rgba(18,150,214,.5);}
  .phone-3{display:flex; align-items:center; gap:8px;}
  .phone-3 input{flex:1; text-align:center; padding-left:8px; padding-right:8px;}
  .phone-sep{flex:0 0 auto; color:#9AA8B5; font-weight:800;}
  .addr-row{display:flex; gap:8px;}
  .addr-row #postcode{flex:1;}
  .addr-btn{flex:0 0 auto; width:auto; padding:0 18px; border:none; border-radius:14px; background:linear-gradient(180deg,#54D2F8,#16A9E8); color:#fff; font-weight:800; font-size:14.5px; cursor:pointer; white-space:nowrap; box-shadow:0 8px 14px -6px rgba(18,150,214,.5);}
  .addr-btn:hover{filter:brightness(1.03);}
  #addrRoad,#addrDetail{margin-top:10px;}
  .form-card .btn-primary{width:100%; margin-top:6px;}
  .form-note{font-size:13px; color:var(--muted); text-align:center; margin:14px 0 0;}
  .form-success{display:none; text-align:center; padding:42px 10px;}
  .form-success.show{display:block;}
  .form-success .ok{width:70px; height:70px; border-radius:50%; display:grid; place-items:center; margin:0 auto 18px; color:#fff;
    background:linear-gradient(165deg,#54D2F8,#16A9E8); box-shadow:0 14px 24px -10px rgba(18,150,214,.6), inset 0 2px 0 rgba(255,255,255,.5);}
  .form-success .ok svg{width:32px; height:32px; stroke:#fff;}
  .form-success h3{font-size:22px; font-weight:800; margin:0 0 8px; color:var(--ink);}
  .form-success p{color:var(--muted); margin:0;}

  /* ── 푸터 ── */
  footer{background:var(--navy); color:rgba(255,255,255,.62); padding:30px 0; font-size:14px; margin-top:20px;}
  .foot-top{display:flex; justify-content:space-between; gap:40px; flex-wrap:wrap; padding-bottom:30px; border-bottom:1px solid rgba(255,255,255,.12);}
  .foot-brand .brand{color:#fff; margin-bottom:15px;}
  .foot-brand p{max-width:30em; margin:0; line-height:1.6;}
  .foot-cols{display:flex; gap:64px; flex-wrap:wrap;}
  .foot-col h4{color:#fff; font-size:13px; text-transform:uppercase; letter-spacing:.06em; margin:0 0 14px;}
  .foot-col a,.foot-col span{display:block; margin-bottom:9px; color:rgba(255,255,255,.66); transition:color .15s ease;}
  .foot-col a:hover{color:var(--sky);}
  .foot-bottom{padding-top:24px; display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; font-size:13px; color:rgba(255,255,255,.45);}
  .foot-bottom .dom{font-family:var(--display); letter-spacing:.02em;}

  /* ── 스크롤 등장 ── */
  .reveal{opacity:0; transform:translateY(20px); transition:opacity .6s ease, transform .6s ease;}
  .reveal.in{opacity:1; transform:none;}

  /* ── 반응형 ── */
  @media (max-width:980px){
    .hero-grid{grid-template-columns:1fr; gap:44px;}
    .strengths{grid-template-columns:repeat(2,1fr);}
    .steps{grid-template-columns:repeat(2,1fr);}
    .reviews{grid-template-columns:1fr;}
    .contact-grid{grid-template-columns:1fr; gap:38px;}
  }
  @media (max-width:720px){
    body{font-size:16px;}
    .nav-links,.nav-cta .btn{display:none;}
    .hamburger{display:block;}
    .nav-links.open{display:flex; flex-direction:column; position:absolute; top:76px; left:12px; right:12px; background:#fff; border:1px solid var(--sky-edge); border-radius:20px; padding:14px 18px 20px; gap:4px; align-items:stretch; box-shadow:var(--sh-lg);}
    .nav-links.open a{padding:13px 6px; font-size:17px; color:var(--ink); border-bottom:1px solid var(--sky-edge);}
    .nav-links.open .m-cta{margin-top:12px; border:0;}
    .section{padding:62px 0;}
    .hero{padding:52px 0 60px;}
    .strengths,.steps{grid-template-columns:1fr;}
    .tier{grid-template-columns:1fr; gap:22px; padding:28px 24px;}
    .form-row{grid-template-columns:1fr;}
    .contact-panel{padding:44px 26px; border-radius:28px;}
    .hero .balloon.b-a{width:80px; height:80px; right:-2%;}
  }

  @media (prefers-reduced-motion:reduce){
    *{animation:none !important;}
    .reveal{opacity:1; transform:none; transition:none;}
    .lu-block{transform:scaleY(1);} .lu-topper{opacity:1; transform:translateX(-50%);}
    html{scroll-behavior:auto;}
  }
.hdd{position:relative}
.hdd>summary{list-style:none;cursor:pointer;font-size:15.5px;font-weight:600;color:var(--body-ink);display:inline-flex;align-items:center;gap:5px;transition:color .15s ease}
.hdd>summary::-webkit-details-marker{display:none}
.hdd>summary::after{content:"▾";font-size:.78em;opacity:.7}
.hdd[open]>summary,.hdd>summary:hover{color:var(--sky-deep)}
.hsub{position:absolute;top:180%;left:50%;transform:translateX(-50%);background:#fff;border:1px solid var(--sky-edge);border-radius:14px;padding:8px;min-width:148px;box-shadow:0 16px 34px -14px rgba(18,150,214,.45);z-index:90;display:flex;flex-direction:column;gap:2px}
.hsub a{padding:9px 16px;border-radius:10px;font-size:15px;font-weight:600;color:var(--ink);white-space:nowrap}
.hsub a:hover{background:var(--sky-tint);color:var(--sky-deep)}
.m-cta{display:none;}
.nav-links.open .m-cta{display:block;}
.nav-links.open .hdd{width:100%}
.nav-links.open .hdd>summary{padding:13px 6px;font-size:17px}
.nav-links.open .hsub{position:static;transform:none;box-shadow:none;border:none;padding:2px 0 2px 14px;min-width:0}
.foot{display:flex; align-items:center; justify-content:space-between; gap:14px 28px; flex-wrap:wrap;}
.foot-brand{display:flex; align-items:baseline; gap:11px;}
.foot-brand strong{color:#fff; font-size:16px; font-weight:800;}
.foot-brand span{color:rgba(255,255,255,.5); font-size:13px;}
.foot-links{display:flex; flex-wrap:wrap; gap:7px 18px;}
.foot-links a{color:rgba(255,255,255,.72);}
.foot-links a:hover{color:var(--sky);}
.foot-copy{color:rgba(255,255,255,.42); font-size:12.5px;}
body{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}input,textarea,select,[contenteditable]{-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;}</style>
</head>
<body>

<!-- ══════════ 헤더 ══════════ -->
<header id="top">
  <div class="wrap nav">
    <a href="#top" class="brand" aria-label="레벨업과외 홈">
      <span class="mark"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH8AAABgCAYAAAA0Pa1dAAABSWlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGB8kJOcW8yiwMCQm1dSFOTupBARGaXA/oiBmUGEgZOBj0E2Mbm4wDfYLYQBCIoTy4uTS4pyGFDAt2sMjCD6sm5GYl5K5cv9YVF2jNualVtD3b77r2LAD7hSUouTgfQfIFZJLigqYWBgBLqGQam8pADEdgGyRZIzElOA7AggW6cI6EAguwUkng5hzwCxkyDsNSB2UUiQM5B9AMhWSEdiJyGxc3NKk6FuALmeJzUvNBhIcwCxDEMxQxCDO4MTDjVsYDXOQGjAwAAKL/RwKE4zNoLo4rFnYGC9+///ZzUGBvYJDAx/J/3//3vh//9/FzEwMN9hYDhQiNCfv4CBweITULwfIZY0jYFheycDg8QthJgKUB1/KwPDtiMFiUWJYCFmIGZKy2Rg+LScgYE3koFB+AIwaKMB4+JfsfmfKnMAAE32SURBVHja3b1ptGXXVR76zbnW3qe7/a261ahKUklW2VJZbiTbuMFxyaYJxIYQXJWQEBgBgoMhIYlNRpJHXlUBARKavEHyEgwxJOG9kNxKIMEJPajcgLGxhBuVLMmSpVKpOlVzu9Psvddac74fa+19zrlVsmRMiHh7jDNuX3X2Xmt23/zmtwjPd6nSKsBHicLktzMGqqAzV4aYG2KIm7vd0hJdnfylI6tqjuAkjh49GvAncN1/v9r77iM//faU+sBKMRwa6ausrDx1LaOXV5O/dOz+++3xw4cDEemfxPtYVTUnAZyceCaqah7cKA5c8fSqawXu9EFfOUTYX3lzUxHQVYNFHwKCMEQBVQFUYQyBgS0jci3ncC4nOtfm7ImFnB9dzv0nDu+e+TwRDTF1P2oPHYYeAeRLuSf6Qj88psoniAQADIDfv7b5554N3ddfLfw9lfCdhehCUJ0XHxBApVF3pkv41A5LH3/VvPv1O5aXz8ZNsGpOfgkbYPJ9qKp98Jp77VOe37RZhtf1Re/0gfYGF0ylCEb9tQ50jdR/bKXLf/Tnl/i/z8/PXwWA1dVV86VsxFVVcxQQpAd+cevirk+PFt96ydPbBgGvH3q6FS3bKwgoBCgcUDmgEoHzHgIgqMSFB0FBUFEYZhg2yA3DGEZOQFcEKPplTjg/w/yJGa5+d0e7/OA33LrnUUrPonlP2wzzS178+h/V1VXzoa94+zdfcvnf3oS512XAlRIIAfAe2KgEpfcQEbSyFtqW0CEg21rrr+T8my9p67/8ygOLp6BKCuCL3amrq2qOHqWgCrr/iv+uy4J398Uc2moBayUwKIGy9AiBICJQAhiMjmVYX4EHa5dun8v+wztu8j+xe3b3pSOrak4e/eIelqoyAQoiZQAfWR99xYXK/o1rjr7Gtc3iAMDWCNgoAwoXpFRVrwIvREFBQQUAU1x8BYlCADQrKApRUYWogpRFAFXK2XI3M5ht5+gRw/TXddGEzy4Yvv/AQvY/v3bf3G8SUQCUVldP8he7sW+4+Mfuv9+euO8+/+D5zbvOZp2fv5rZ110aAmtblVaEsFE5Wsktlap4tgSJCFgUJEFFVDQISNT2Oh0sVRvYn7kf/p579n8/EaD6wjdAvQFPP1vc8TnK3r+W8ZsvD4Crg1K3hEKpgSSAvAqpECQoggT1XnBtayCuLHDH0qLdNd/FQrlx7q6O/66vu3PfB+r7e0Fe5361J+4jzwB+69nhN10O2fdssX3jlgWubgFblQ9DFS1UOQhIiEhUAVEoCJSWVEQhBCg0rbdCtd5cgKpCkDZw+psQ4ieqQY0q2mAz28qw1M6wTB7zbvjgipUf/45X3vSL/o/hBei5HvhHzg2+/uks//dXYOcvbji/pcpKhgUKHxRVUFQqGInCeYEPHnEBAtQHiHM62OwH6yt+1YH9fBCb/+3v3LvvyNGTJ3X1yJHnjVWqykQkf3C2/8ozrfZvXmKz8vS6d4WqURBXqipCVHrBSByKoChFELxiVAVoVWElzxF8pWFQhl7O9s5Zg5dy8e5v+bLb/83zbQBVJQIAIn3w/OC1n7etf76Rm8NXS+DqppctCTpUsEsWzSIQAAqGqIwXEQRVRVCFh0CUoJJWHHGDANEqBDKxIeLmCKKACCQInASFiGYC6XLglXbGO7IMy2H0obvn5Pu/4dAtH8YxZT0OfSEGRjd64B89N/zyJ7Ls/qdKa6vK+ZLYCqA5Q0QAr2I2XMCWUwy8oPCCMgSUXuB8QOUCXFlBncOSUXRU3W1LC9nLcPUX3vvmO7/l+XZojPHQh66t7X+omvnD85qtPLtV+ZAZa0nBMIAh9IuAjcpjwwUMQkAVfNyIXhBU4QqPsnLgqoLrr8ucsn7VbXvNq3vDbzp670v+Ux1SbrjwycX/xqXiH50X+0NXjeGLGz5silJF4KA6XjQFgiItPiAhQFQQlOL3VaGq8FAEUajEdVEoVAmUliEgbpj4dfyZigJx/RE0QHyACwGiDt0g0oPoTTM9s9cEvd0Wx971ZS/5QdmWJz3XxZMPHIA+MRze/LTN/tvZypqtwocRG8uAzlmmL9trzOF9xqxkhC4RggjKEBe+tn4XBD4IRBReBFeGJa4Oiuzhpy+4J6veX/+ZDz/8LUeJwuqqmud6Uw+fBKmCPz1o/+yzebZydqvyQ8M2A3SGyN87I9WXz4RLe2x0r16iN/Je4QPgAmFUBQyDh/Mem0UF54nnZ9t0ZuTloU1634fPnbv56BHIsWPK1y88q166NPM/nq1++Wyv9cMPD0CPr5fhCtSUTGwoVjs5ARkIVhUGihTUQQqoRFcfBNHlC6AhfhQBQv1ShVeB1/jMNG2WIMlbqKJShVNBUCAAMXwoYUuYL3o2j1zbCH+01senQ+8HfvxjT/xX1bWFE0SS1vQ5L1t/cgggIpJfPjf6F1e7dvnahvOUs50n6MEFQyssfq6QX93ZMo/JvHnvs0OvQYTqxa6CoPJA5QXOO3hfIVQOUlaovEdFMI9d6cvMLP75mTNnPnDLLVivLey6fOMwwqnLg79QzfS+6swV750xds4QFnOm5TnYvA0c9PLLg5F+02eHdt6JUy9KXgAXFFWQuBmCwIcAhSJrt3ChqHhr66LXlaW5+Se2fphuom9+eHWVJxf+6Emw6qP2Vy8s/MqFmey+z1zwbiiwIGtyIuSkaIFA0MbaKwAjCYASvMSMXtLiSxPzERc57o9k+dH9ExREVH8j2qQCHgpRgUryKBoTRVWCqIFHgKriaiDTryqU5VU3WNn5l374I9dufvCxx772HqLLX8gD2CajJgqfuVa+8hMl/8Uz10IoCaYjKrctG7qrJQ8eavG3E9EnNwo92DX0XvFx0UMI8D4+bBcCvHfwzsNXHs5VCKVD8AFOA5eF8/t6e3Z98EL11wD6V8dP3W8BTMXdhy8fVhDpxadHf/OKQkutqMW57msTXjmDrQWSf7s+Qv+iyD/aEDW+8gghUEgLXW9G7z2CD5AgCEGwVpaQqsCIYFqX1nQl5EcevXLlHx7cseOZehMeP3XKnDx6n//vZ4v3XZvP73v4ond9RpZZRRuENonMM0vPiumAqVLBplNsuLr6EQQVFAI4UThRBA1wohBhBA3wKeXjmFFANbrf9CW0icV18gcoKIaOCA3ExJAApegJVAlbgVH5IqvOnndu59Jr+JL/NVU9TMePD29kZM3in94Z/78nCnzHVm55WBW+ZEMj78KmGltU/Dlq0ycB4JIPP3LFGWx5kcqLKYOgCgHOK7z38D662uA9pPKQqoIrRoBjnA1CH8vWdGcw7yDgX504dVhuEGvDo4MrN33kCh2+tukx8sRFkJAtWzvL+NChrnmPqvYeHOHvXij87NCXWkkgFxOiGAIkIIQACfGjdx7iPMQHbHqhdUW4qgv5Bz595asBvP8kwKuqOErkf+2p/l+/PNv69scue7dJmuXEmDOMWVI5sGT5pTNgGTIGI+BSqRhKQOUUhRP0RTDyAaUonEj0AhA4QXw/McoDoGjpafUNM2IlpAABBEGdCdBE8qeIXkQRQ4IACAQoKRiEoVicq1y2deacL3cu3fvDv/OZX8x+8AffcfTQcaOq1yXZFqp0Agiqmv37M8VXDwRgMswEtKyxT15yuntn/pefGLqLUOsuAn/pofND3XTBjJzABY27PsREy/sA7z2kcvBFBV8UoNEQhjuY6XQ5hEBr/eo1cuXKHO2gzcldeSpiSf7CZvdNvtuaGw6rYNgaIJgLVz2uzvN9zxT6Tx7p+6++4M3cpUElTojFI3oeIQQJCBKgItAgCGkjhsoBwxHEOTxT5licHWIfwlcAeP9v/8wD/L7vvNc/1e/vuf9K9q8+dzXIZRcsWYM5Q1i0KvfsMLxL8IkdHr9eAn9zYLHrwrrTZ0aeLpeCjRAwDAGljxbvgkIkIIDiBpS06IbGZk4KCYLcWBDH5DH+FiNjhiGCqqSKAM3WCarQZPkAR89AMdcYqcI5b89tbLrl+d1v/2e//Yl/8fffSn/v+P3Xe1nWuA31w2v9O0tjX7I59KiIuMOEm9oZXrdoab8VdDv2e9cs3vsH5wd6rgy07jwKEbggqMSjCh4h+LTw8WGL86AggM1R5BYKIhdUNzVbet+DTxwEgOM3KDc3RF8rBB3Fygl7Ohnd1GK0LPeohR+4oPZNn3p2hM0ALkRQicJrdJOSyqKQQlLwvvkIw+CZGWSzc0SWse70HlW1a4v3ChHpH141f+9CO597dBBkAKIZBmY4hHtXDL+E5b++ukuvNb74+b5B9/SGl0f7AU+NHC6UFa6VDhtFwGYl2KwEfecwcAHDosKo8ihKh9GohKsCqsqjKtOr8iicR+litVRUHk48AmLIiFaf7itVCfUDmzRjYUIgAMQQm2FDkH327CX/Odf9u//PRx/5mhP33edXV1enkmx7KoYc2Srtvb5tqb9V+SHEOiEsEJC3DeYMcGld/MObDs+Waq9UgqGv6/to7VK7eucRnEPwFYKvousPDi0xGCnj8xsDuXV2p1kfhIMAPnHo5HjxL6f72fTY1zegUXAIIcN6ECx3CZsl9PRQw5mh52tOeeA9SvFwSMlVUASJCZKEGIZC8BGKlJhVazVC6YQ+r8CuGdl38tSpHSeP3ndxfX198T+c999+esvrFry5iTN0iOTmOWN2e3noQIe/Oai2PjuUX3qkwOxD10bhmcLxmvMYekHlU9YuguAFIaRkLcSFC+IhzkHQBZEBEg4QRKA5wCbW0SEEdHstQCMsbKK/iLGdkMCjcWYgpFCq3QADRAgBOF8MUWXKrauQnuOfWX96/ZUL75+fSrKbbH/g5eUjExsOBjFr7fuA9YJwHoSRqN1yhC0XUIQALwKn8WMIIbq4ZGHiA9QFiCsRXAF4AXEbcVWgWw7YLIuVmG+cahb/dFr8UrBn5ABRJgfFlioulop5tpSB7Loo+kFRBIUITViGNA9QgkCDAl6gXqAhwFcVEDxMK6dLG4Wet7a75mdfAuDS75wvvvFCa9fS2Y1B6LWs6RpCiyC3zREvlfI+Iiqe2Ao/eqXNr/zoE31/sRJ7zXlsVRItOYSI20vtcRQSQoRuJUCCRyhKQAkmz2MOonEDcIMPCEQFMzMdOO8QFFBmqAoIgDUGQgApNakhIYaROoeQlAMQEdYKx20M/M7Z3fv+7eNP/ShOvOo7jx5aNYh5Iri2Nqd6O0e8mbwqQDFpGYli4BWbTrHpBcOE7DlV+GRhIooQBOoDEBQaAiS4CHZ4SUAFpYfh4VzApa1KAODUqbEbOlEXO4KZSoBKCAPEbHkUCFseGAVBIYoyxPo3KEWrTxFRRaESIOqh4oEQF15DACSAlMBKcC6Ei0PB5YG/jQA9fa34m5/c8vDEyEiRK6HNxLMCLLXNrz9b6B2bjL/3+2fK8GzpzHrlMHSKwgeMfEBROlSjCq708VWM4EcjuMEQfjiCH5Xw/QFGm5twhYcbDuPPBiP4okI1GqHa2gT5ALYWRVXBB4/KexTeg4jiJqkhQKQSEQCYoiPgeG/xNwlBCNeGzjx95Wp4ast/6wc+evqOk0ePhrr+59PH4wMfBru7cICHkFNBSHG0kAibFl4w8AFliDE2SIxFqtrE2fgxAD6+KCTMn2KpIj5aggEBnD03tCsipQAbKvBKCEooBBiJotSY3HkZ18mqOhX/4iaoMfL6PYbGMzgXQ8Faf4RPPXmh3Hr4qT0fv1K+9slBX4lhLAgKoEVg6yAO/lXPVvJfHx9R/vhWSZed0paPiKIPMadQ71GNCpTDAr6sEIoSflQgjIbwgyHCcIAwGsBvbCAUI7jBAK7fh4zqTTJAtdGHySzKqkJRlvCVw7A/gBGPTm7hJUzE+unKjZL1EzOUCUIEJWDoPV0bjPSyZPmnBuUPEgEPnzxJAGBPnCB5TB9r/dZT2DMsBQZMojEt9AJUQTAMhGEQlKKoBAgiDWolEl2dpgeLFAJEQvxcAyzZCE5EZwNrFLl18d0fjia//fIKFKqwGuOdV8VIFDkUXgFBsnZCA7OOIVNtamgIICn7pyBQ4fhzDxTBwXfK5X/4oUff9tmlg5RlmVdRSxrv0SpDnfA12JPPBuDhi31dr5S3qoDSB1Q+xvcm3/EVqlEJJgsKHqEsIb6M8T14SFlG5LM9Az8cAMFDswwgwBdDqAtgm2GwOUBwDl5KsGHcsnsnLlclvBIMorE1mHTsN8a4TxyfBxGUOBaMCmyMKnvh8jVdoe47P/rZpw68/mW3PnlMlRkAiktzC6pYDl4SkgQERHjWC1AKoQgawQtFdLWqzYKrCDARdxECUHsCjTVr7E9E9LtDipW5nqnXfvuVs+GQWp4BigCBV0UZanRswqI1NkdUY8yssfDUKmuyZdXk/hPyBhH44RBu7VL3MxcuvWorYd2a/i6ogEEolHBhJHhqvZArXmjDeZQJxnZe4F0ElMS7GPbKCtXGOvxwCCmHCKMBwmAAGQygRQEZDRH6A+goegMZjeAHA/iNNUAVzgWU1zYg/RGKrQFuWVnEIARsVh4KgdcwxjGmAgBP4AccM4LURexXHmvDIlwOuTl1Zv2bEeMtWwAYcGdOlXpVEHgFPAQ2JQ8egEvlVJmw/KaRUUOYKfYj1dYaAe1obRrdvgoAERhDZDSgHI0uRUTvcuO/jgF0Ii7bs8qAAMopOxEQfEK7Jj2eaup6TPaqtI79miAxSRsheYMQN6ivClTYMheHZp8wNeU30q+ICgpv0fce1zx4wwMjiaCNS4hmRDF9RDLLCuo9tBzC+QjWiCuaagNBQCIIwwHgKkhwIADBVcBgBDO3E6PNDcjWBlSApf03wWdtXF7fRJ5lCEHgnUPpPNrtHIYZIQSknC+1jOtCIJFFEPsCa0XJVzcHOE/221T1R4limxqqtGLbGbyKAESCevfHjeDTwldSNxgCQvq5TrxI4s1JXcIkUJpAydpiA6TFQMamn8heY2i3rl/UDHjc6Uy0J0WVul6YgEOnNoFSzIQby09dFCRctGmfApAALUYIm/25/jDcpERAEG5aqhLxe68eQw9sOsHABbiE0ddVhS8r+NEIYVRARgVCWQDeQYcDhGEJVAK4EI0CALGFVAExfBuoU0jpI94Ghrt6Da7fB+Ut5DsWceHqWvSgPqC/McC1qxvY0W1jqd2BSZbOlFafGOBk/VQvfnwWm0XJF9bWpK/21p/+yCffhGRYWB+FdkgIE6UCon6gQQguuf1R7Rl0MuGrY35IjYz4eb1qkb7DKSQLLINaJNi3Y6Y/vfQT4APrBiN2xhSATxh23enilNxMpzyTLj7VwjrOAXRil6oEkATSUQGuykNesQvMccWbnCEmpk4IfQ9secVAFS7tJ0ntOVKFVBWq/hb8sA8phtCiAEIBlCXUxeybOIPJ2mh1umBlkLHI8zbyrIVW3gK1evCjEuhvAQHoruzCYH2IalhBRLF+bR1lv4+vPHgT7liahVMXs/uJ59DAwZNAUE0UUcbVrZFcdYTLffyFps6vMrsbFghEIgre9kxjW1Gi+w8piUIdbyXEyCyxro6uPiZXJCEBDwbi42bILDGcC23tnQOA00fGa3hXes9tLa62TAtcQ5fp1oIKJD7KZoPWeW807InFn2DKjH8hddHEAyGQOof+cGuHb8k86dhKWAlghSGgCoShV4y8pPsPEE0bSyKdz2QWzAQ3HAFVAQ4eogAJILCgPEe71U4xGbGcA6NlLYgBFQPvAbgKZCxayzsRRFFtbsLmGfqX1tDttfD1rz2IIMAD17YgYHDqAujEsmsCg7RZ/Zo8AhiT0UZ/gMvM9zT9fNFsr1BcZK8xi57EEUUFLpV+zTPEOKGKfehtFlbvwLp7JXEFMsPoGRm98sDMeoJ3m8U/nGp+w3SppeNdjNQ69YhUqClXP+6Njv//SW+w7b1p/XfBE1yJzPBOBfdS35TqTUUawZRKBKMQUEgdyqY9jARBkAAYhmm1oGIRKgILg7IcJrMQZ2OW7yqMRsNYBg4LjAYDjPojFIMSoazASsi6C6C8h3JzAHUeoyvr6M718NqX34GzI8EDa1tomwwtY2CIUrynptwb3wG29QMEpa/Ye48N7+/+0GMP7rQA4EELdQUZNPaSOW5+AAqHCKj4tNB1stdk25OBXzR6AJUYN5mhiCgVSLVtMmob9F95++19TGyOyatr862MkyWnpAXKkfYsEexklfS32uzyyIExgLr0ntCEssbqNYWi9LPhaJSXs2LaqOmT8e9YAYXACccSV1OJWZMzVJokTpyDVBVC8KCMoS6HKNButUGcxQXeqKAmQNUFVquR7UOAsQSnTDCEXgvKBr4YxfKvdFi8dTf2HbgJzw6HIFWstNoQFYw8oaQAEIFR8wNpymOPS14FiaAIQhtbm+rml3Z+8oLcbeMPw55KYjfJq8SaEdq4VkkLH90utvHMxpug2QgTtTYxp8RNAYJ2WhZMet4aHkbnNH7Dlw9HGzYULsArMhCFVNMrxRsU1eg6ibbjHNOx6npqVhMLY/0fk8BWp9eCtSnR05QoKRgMBuBU4CRVGjomYE56PiQMgSVAxIFzAwkZXCBYEih7UOmkRcrLcx2zY7aDljUohdEvHZ5d62PkJSBUpioGYOnAqWDxtn1YvHkPhmWBniH0LKP0wFolKJxvuFjUwLs6TdCjMQhGCWYelIWEkJvgs3uj5auZTc8CQRFjHsW834LhheHq2j6BK6LjDlNtTRRrvujiRUEkIGJAuCnHehmjldHFIAocOck4OcYramx/4OXzMiqRQc0okSKVksWBYEEx09XpLhfVyQ2lnGBiczbWPoGJQQKMtXtUCJCQvEq6HwpQNU2pKxKa+xYFtKaKhxDL2mbPMZQZebuF4A2KwQgqXnfOt/kVyxluXmj/3v4d8x/ZsdBeWxvK3JX14csvLOZvfbrKZx67tqn9qiABMLt/P3orSwhVCcOMrcLhcgoNezsGt823MAyEq1WJLTCCjyU1TSVC47CpEmH3MgiGzmOzqu6w8aHpzrpcnOwY1dYlkogSE5nwFMlAx3CqYvopE8YERmLVTm4wY/VpAHjLXTvpgzew232drHx4KMGSMfHBJp47pU2X6ti42+U5bF/xXGGltlrm2Enz3m/bGZFKpaoJZIqv5u4mPZ7EjqY6D1LAEEPJgNkAhuEkyEwr4695yeJD77z3wLu/8Y2HPlzJtIE+fu7czf/x9574R7/Xxt/68MVCwtwCt5bn4UqPwBFNnc0Jb9o9j7ftauPmjsXDGx6/f3mEfkkY6I393Tj/Gr9f7wKNXIVhafZbVTW/cLaccyH+sU9dflJF7MAzPCK+rkJNzQ3V6zBmSjEzMc1izc0M1WhZbIG2tei2cBYADh8GPjgB7R4H9ASAPR230SHTb1map0pTyR2z2pAQSEId86mp4XUitk+DQNq0Qg3qLwXMjF5vJlmFTG1ZAiI+HsM6AI5NoZRUMTPYGthWK3YtU69B2YPFQIngvVMwaN9ca+OHvvLg1+w/ePAZHDli3nLXu+nw4djU+uDDl/X2m256GsB3nfjPp+xTMvMdT7a7wVfeECu6sz2szLZxWy/HyzuMeQOc3wp4ZqvCIHiUpKlCnYa3xwluPSEUjcj7GDKq4Hdb4LSp9CXziUlKARFPpxTzaSrmTzdTtjdVpjNhgImTd427z7JBjxVtY84iUXe2NScUAPbOzm5YHax1TTYfa4y4j+pav45zYzCLrt/3+tzpwHhvUHw4KR5OVyzxvpGwBdHpjUWT2Lo1gLWQzEAUsLCQwPAeweRdu8OWf7D/4MFn7v3O92UP/My73AdxcmrTH7v/fnvi1Cl5xx37/vnHB2vfcrZEluUWCzvmMN9rYZkIJgiGHvASy8PMAiZ5QKm9X12CTni+ej1q6w/e03A0gqC3Ys9v3TwXBLMSFJIYZHW6Z5oKIC58qClgSikpTNaeLGsyo1aRKfcJKDJD3EbAUrv1NAAcOnT5uiU6dkyZiNy/+OzobDfnW1HEfF1Sne8nEkTSKXt/vpmrGPfruyNAJWAwqkAmIXANYTLdTioxA0VPoduAlLqE1SCpkxn52ETR90EVrYzRJvf7UKWZ46du+GZP3Hefhyq9Gnj85ic++dn9iztfOejmAcKmP6ogBhiCcLVQPL4B2EQcXXchGoPSVLdvXNFo442Ty0aWWTAzNooKfK3Kdwp4vgoeAakDk2J6lu40aByCgG4bM2oyihsn21SnowmBya1ho97v3zF3HgBOnz593V8/fCj+Wc46aJm4wGGibBEdF3X0QtYc22t/mgoJo9LFdmMNS9dYAAge4/J28q+nQKa68rAmvpgiXSz2zNCyjFt3zl3E803QHD3KRKS37F66cmDHXHrnARkBM9ZgqW1wa8/gwAyw1CK0bKJ7E6A8XhOpE9+6tyF1fRrb6d4HMBG8BvCW15vUmNz7OE6oyfZZAUPUPHyZhEonsPSGToTJTVE/qdhp0hikNcsMOpb6X/nq268CwPHjx5/zgbRYRq36RraBPdrQFieX8vrP9IYTaVNdIQwHo8j4meTDpU0uzX1v/3ci2YUIYGaQickdTNwAZCgSMonJSIB3/hIArNzA0zXj7Eci0J23stFyr41eL9NuN8Ns22KlneFAL8dbd/bwrbfM4Vtuncdf2DOPgzMddJlh0vupff4YdxmDUrXlS4hdQUvc4kJ1WSwjqKpoZIHW3pHSYjsdP5C6Dpbml2gaQtUJgkXCnesav9vKkRmcA7AeQ/z11nBXopErcKllASbUaQtUCS79v5waGl/InlJreyo/UGrqACiAovSpA6lNS6wOM9AIJesEhEqpJgJrQ56AiRuA2ER+HgFkYpNFjYGSfV4ndfL0kbi/W+1FNga5IbKIGAmnHlWQyA5eLwUXhgWuFRUqqYEwgSYPFi0+gEJouBZI36u9pioKdsHu8BiTI5qdkzyAIHWxUodOJupm1TF8ylNgiqZciMeJCBFauUGvRRvmeWbIACCDbBkAWd2hqlvDqje048nv63NRXLflAAAwLEfp4UgzFVP3LXzKd27EmGGKrp2IwUzxY9oqEaI2gGGlrI28ZZcA4NnTO+m5BDD0OFT1E5kq7zGkyNiQIcASISNCzkDGjIDIatqqBFuJYCOJ/FBzFSK6WoNuMmYAJ7TTKJABhoeMpUQK1JDcOBFAKpHcEAhBkGr86YdMWttCBFy07gpK/TNOw4axsTdjLTI2z0gUbLjxHFlidyjTpRYDXGMJxDEKplBSt3yUOBoi6Dlr/TouT9hu833nAlR80/uvuYBB45xdSJOzzX3XnoQAIgaBI/jkHYL3iOPpySFag0oN1gvdF+vdG1/ve+ABS0T6oTO3vzmfnbmt8pUYwxyMos2MNhvMGMKyjQtX+YBhAMpk5aoBEjRxJhLDt0btVGOjTQUMTdGJkDMNOIguupTJywQWnEwfgSQCHDpO7iate1xPjoGfaV5F7RkIPZOjbbOz0b3f2ApqZs+cQWV1wntMZteqE00MunGp9zyG35R6CaPf7lFqy6+ZsTcEi5KHYGbk3Q7aSwvo7tgBnp2BzTO0Om0aqGBI9m18gxCnqvS+T3wie9drXuMsgKdc60fOK+OyCtgYtClCzKICFzyKhHBueMGGF5QJZay98RSdTsfToLHDGqsyo6zGGsDIZVuK7BCKTJlQK44oAypgrXl6BgKXrGKi1pnI8HQC3BkTLjgxSQHLglYGWGuf/kLLcSrRecnrObJAHEUgSHRPECKE9AY4DUzW74MnuBrQSSuP743q90c1hNu08GNyBECEIEoNdSyfNNj0q0yEjBjUymAyA5U2xAlcWcINhxCJsHa7k/HG+kDOFtnrPvzxj7/8Ta973UPAMcYxACdO1ONTTtefXvp/r+z8qSe5/bqH1gcyMMSZISwwYWdm0FJFqYTH+kNcRI7zhWC98iiCjwzmMGZQqYT4Ch4qDgi+ifWQAIJHbizm886aDao7fAACYrnelEbpnusxYdVJcOcLWZdeH1pVQWzQsoTl2fbohZTlvZ46G6LlT8fzbbNuk23jesHpeaxe9bqvx2IK05CuEDVZvSFGxgpfz70kSrgPLg2G+hTvGUEkZvszHX0yZO3/+zPuP/3uhz/7rfd9+cs+ZYi8IeCPnrl28x+tm2/4iXPmey932wceWRuGDbbGMjDHhJXMYIcR3N4hrFiLM4OAM0WFS0PFhlNUExzKRhAiSMIbEu7gBRTiunV6XXRyqy1r0c7zx60oLYU6UadxaVU/OZ82QFBq+nxjeRFprL0GFxqPQIjQrpe6R08ZBF2qLgLAocs3Lnvq7w/Xq/MuA6wSAxrDEjgORtREBJpStklYhzZUlilPTeOPUwjBBOUlhqhIexaN7WNmhQVgKTJfTGLAyCTniQhsDIy1QPAoRZBZi5kdC8jZ8Ob6hv4+zx+68vToD//dr3z28e/8lYcudNuthf94Tg+Ui3OzzwxKXLqyGSpjjSHBkrXYaQnzTLi5Y3GwDexpK3rUwu+PKgylxEhCpK8nVpF4Bwk+zUz4ODMRQrJ8B2icIurM9KibGbRz/5AF805fKUhBUzGfxvWiTDZwpnDjbdSpBvPXiWeqNRZORgVdoo3t3L0bXQvzXcoKjWFIkkeaalnRhMWPK/Ha+q8z/QlWj05GLtEpyHbcmKJma1Od5TODWMAayRrMCtaopCUm1tDBe3QWZtFbWIQxBmFrgNnFGeJdi/KIE34ys3fkub0jd4IZnyFsbHqvxMZkJjMaB0YI2JUDt7YIL+0Ae3JgwwFXq4C+dzg3chj4mAd4HxDSRBLSS32ABgeENDsuGvm8wUOD51yrsH9u8UHrRLtaQ5eNt6+BQo4aMjruh+v1KVN86Ti61tk3qUl/EGCNZbgSXTvz7Hb61uRVo35cVVe9o9KyaUG8CqV0BJE6XpebNGG9OtHceM4Ub7Lu15gpQyU1pNDgEpL0cJQpjj+hKWEi0YXGm0IJCC4Ogs7sXEa724V3AcE5lGWJXfv3wnYtU1AlJgVBhy5QVRW00JuxmSgyVvSYMZcZOCdog3FnV7EzI/Sd4MJQ8bkNhyf6JS6XHgMfB2uCeITg4tCM9xBXQXxiEftY61My5sySdNpttowL3/S6uz/LlScviGJBOtEGrLPGKBmi42QP2gArNblhvGm21cOgROJUza2FZWwu9+TadvrW5FWjfi6UQ0C9oTjJJinchFRyElEaMd4O6+gXDPhTlKeJzb69I1h3OMeYR3T5pi6FaSywAFJknRxLO5cxMz8b5x2NQVlV6My0MTPbAoJHbg3llrmTsZntZgxV6hIwz9HFLxpgFyte0bPYqBz6XtB3hEc2FZ9ar/DIVomLZcDQe7jg4F2AOAck/QF1aX4gxK8RHCC+zn6RZ1Z73R4WW/yIYR5YIlmunMIrSBrmR7y7misfMJ6AkaQSQRMxftJiJgOpEprmbm4NaZArb3zlK9fwAvT4Fgyz9UxMY1qKNNIk0xzDcYmpjdBQmBzhUlzHctHaDTBPsB4m7mXifgkUIXsiGAZYDJjjUAdD0TIEaywYBO89rLEQH0PA3r17oN7DKMGkUGoUsIbQLwRtFcyQQdsAKxljlzW4Y8bgapnj0+sOBzqET2+WeGKrxNmRi1l+MwkcBZpqPoE6D/UecD7Geh/RS5DCEiG3Vme7bcx37K+KKliZO0ESdUunQ2TQ2CtuulygMVaxnUVzndKTaRoNIAUz0GrZYW7IvZBsf+fOnZQxEaeJHx1ndJjqvF/P0EFqTz5vy2f8b01UMIQoiYbxNBDq0cdk7YYJloCcgY4x6NgcGTFYFZlh5IZQBY/Z+S729lrwTtBiCxKABTBg5JSkzVzAvpbB/tzgYMdgf5uQq8dKZjGqFB++MsDj/QpPj0qsVR6l8wguwLvIHQx+bPHiS6ir0vRQjPcsAtaAzADttjVzWupdS3O/E0Orl9R2lQSqj9m2kaw5BhFkigH7HA29OhGsCYWpqZNnGSrvL3kl4Miqeb6lme+iIEVh2EzgCJgmjmxz503y+QVi/nX9QKUJ5Yu6ZxO/59K4mE54FJPGKzIGWgy0DSGjyPHPOC48Jzzi9qWFWHtTQMYaY7AIjAosFIYI3nnc3mXsYsW8YRgVXC4CHtqILv7xLYezQ4etSjHyIeoAuADxVRzzbl4V1EddBPUV4B1IAogUrAHGkMzPzFHPms9/05vvfhgAWUzn5ontSghEjdpULQygmA6y9NztFMDQeLSKgIwUXTZ+O5L2XMKA86dObfq9b1i3xiwmSv2YdIvoQk3dZJlIPkHj4U3S6/MRjaSgpg4k0ER3ctyxJ51kLdWYfl1CKqwCkiBnUzdfFCAYCICldgszucVa6dFiE+f263paAyQQDDEq5zFnBNdKwcWBwyh4XCgdLpaCZ0ceG85jEAJK56PsjQsIrkovB6l8tPb00qoCVSXYJZdvCDOzC2gbkvnZLq3MtX+diPxb7r/fWqJp1kcNbUqt9LS9Zz+RYStwXVe9mRyaqhsIBoxey1YvWBj28Czx51JbcDtbd2JqZyqGTw1y6HWfjenM9DzgDzWMH5kodafaxFOIMk3AwrEn0soNrpUFBj6+95LiuFsGg9KjNilsOo+zg4CLowrrFdB3gnXnsdWMxEeBq8pJVBdzrrH24KL8jVYVQlVAyxKoSsBFEQrWAAoRsF1cXDQrLaY33bL3ZwHg1OHDYqGIM/R1TKexiGBIc/XbY+LkSitTVI9o6u5tm0EBJVFjDdb7/XNfiLg5fd0LUDnuUWNMsgBFEQKeVJHUyVSNkh9IsG69qSczdN2GGCa+Yt1QjlMvFIElaKSQ1W1xofi9mro/wfyps4hRCBj6Ggyq+y01ZSy1jUUxUuCjzw4xCAFbPqASRRWASuMkcPBR6q5Z7CQuJb5CqEpIVUGrAqgqUFkCVRUTPQ1QjomoBcLc3KzZabPfevurD3w6saXEct0U0ekqySdUb5s43HWtzcZ10nQiRZMbBwAzxTbnC74eAPSu6ycyJ0LPNOZDU42m8QTphO3rdNOq3sANIwYT1csEpD0FdEnaCGl0LTaAxsOkmjCIAJ1mN6cmkSdpyuAaCH10UEK1lreZGAT1ASIe4hTiQuocRnFLVBXUldCyhJYFpCxAVQn4CiweBAGzQbeTo9duYTlnvWMl/wEi0tXUUbWZMQCq8fSLUIJ4aaqs4iQWyBo585KYtHUsZOIpy9dUE9cdFwNGzvxFLP69Sdtymj5VWzuTgmtol6RhrURZkokFrN9/kjkfDzLERo9JnkQTMaQuT6XWKdA0D1dTo+rRdKVI7BQ0wkq+aQ5NCC/rNAdhjDOMDaWsJrqEYULsQhEXPUSdo+jy06sqoFUBqSpIMQLKEeAqGB9iacqMTitDp52HxcUlc8us/cj3ftUbPnLs2LFGmt0GJ+vGmAXxXlOjK5Z5ydXhBgDOJHZeL3gdCxt5kBslc1/M2k81DadJ1QYEM9F80u1UbZ0mcelEPrJdvqVmJ92oZTvF+E1R2ier9qnrV4+jRyGLWvxhvPga6o0oTYZUe5qEW4+JMRgPgMZxrlghqPeplnexrHO11RdAUYKqAuQc2EeLJ8No5xlme21kmdFb5zryxpeuvOf/UuDhQ4eaG7WetE/EC1YFnOJXvZRBKE7Kahjn0yQQTsSBSd5cnVanWEkTg4NQTrXzF3Od0oAvU9Usdepi/DaIlOVadTJOCkX8YQqlk3F5QFqzaaMHEwVIeax+bSYy/SbHoaZ1FRp9B2kobLVocpCk+Zc+RmJHtFZtxJQnwirpxCgcN1419knGGkdI00Djxa/iv5kyeqlKoInxDuxdXDdDaLUsFmZ6MGz8TXv32lestH/26Ktf/vHtJ57YDsMKBOPYr02s9qrI9LkxcmaCEDcZfkOaU92WDceb8y48L32rTi82cc+8ZSz6ytfVVayziaIy5RTARDeAb3RqVLtBJbf9Zp7bNE/I02UMowGBHCZbvdK4cmmsPCD49AoacfXgYp+9ka0ZJ4R1Z1E1hkzRyMHDhNRMVBHzgE8oXiihzgEuZvdalSBXgUIAq4/3xozMEuZnusgyE2ZmF+3BGT79f7zjy//+p1ZXzeqRI5NDzrAQvZyZbDepqw+GGI/2gMCqqYYdd+s4kT90wr0KEUBRMhB1Ykc6JoKKgjPqvlC7v3jVtgVoBUn6EkmKzJIiB1AmNXFKY1zXM1d1YkJjQnSCarww9i9mZjtYY9NsWp1c+UTlVdXI3U8LVsPMmiTofAhRlateKDemdGn6CIz1iaagaZ2Ap1P4ChoaCTmkDaA+Wrw6B/IxtsN7mFpRlRnWEOZ6HXTzloq1ePmu2fB1d+z6ViLqr66umuu0dw3rpp2Uvq/LojShamrxoxuwYpFYLcQMsImlEnP8WupQQFAlqnyAsfluII4oPd/iX9vY8oXMiqREwUZSJzICWqQoeZzNC7ZNJ5JCJ2frMNn9o5rtCEroJZpkdcL3qIxnFmuyh8RwJ1rTpcJYhs4HqHNRmauKI9vqAoKvgBAiv/Y5AK7GWWotehHGgvwSMXp1DvAVyNfsHAVrbHkTMdgyZrttLPRmlKzRl+3fa954y/y3vP31r3jguQ6VsFA9R6bGuSZAHlU4jeiV0PZFT3g3M0JM9ZFkX2PPOyFflLLy4JVGTjAYhQVDQDh5RJ4H5NONdneRh7blJShIyRIjA6PD8aADqjt9kCS5M6nEQWMhptSAaqxuYuTMsEHHcNMlnJw6rvkMdVVTa+c3Y08aD3lomivOJ3VvByljNh4z82it0LhIKiEaB6YQ5nFZiagXFBc+9ufJe1DwoCQkCQ1gKJgJzAbWWvS6bcz32pJ1unpgZd7cs2D+xrvuu/cX3nLsfnv0KN3wOBnbs7aIrUoFy8TeT2VO2BaNKaXttfiXbzL5aPVIXkBCTB1N5NzRsAoIlN1+/uKlmV27qP9cGvDHT51ixArnTtPLrRsMAwPGJnpUzgLDiU9P03NpU7QxbTRNG51bTFCrNQS0LGFXb658TKlVEwBrXmCioyIkkEfrqkbHZ+Y0cnQhLn4tMS9lGQEYV0ZXXRZAUHCex65bWvxmvHTMQhnP+ydJuzgK5xuxq9oADcdj2Fp5hm6ng1aeB263zJ17VnDPSv7u937tG/7dsWP32xMnnvscIdtmPV9LoHCz+bQhNIhOz/qP4V0at0Xr7E4F6hxCWUA8oGyi0keW09B7HaG94zceOnc7gE8dvy4lTKju4cM4oUrl05uvHgIoVNUSo8UMQwE5c6zN68laxXUA06So0iTwQ5NDJCnhAWETxu6kJMXWMINr3G8iYdSJk7ImmbINeTI4SFnExXYVkBafXAWU0V3TBB+CplTFEtbYUK1jdUESaw6GRs9qKBqBzdBpt9GJauZ+dnHJ3rmjW3z5Td1v+863vfYXX8gJYjZnOWMT/svjtkZDY/J1OVVz8idAv8j6TSCq81Fu1AVkrQym3YpKlJ4QRg5DL2GYde26ZF8F4FNIFn5dgZcOLVx7YvjGqwQ4VbJEqLxgCI36YaTwHPXwvExP1tZlXq3FN7mDiWoeYkpAydDyjuWdWLMxV6lBq0jRbdrIomO3Xws0aC1GJToxFJFQuKIEpbYqOQdykUlLpcbpHg1j3ZOJPgg17XBJJaCksTACkQEbQmYz5K0M3TxTyzYAZG7dt8fevtz62FtuXvquI6879EdvOXbsBR0dZ3vAOQoBHBKtQWVKy0V0ki+nDaI3Ce+qKjjL0F5cBC8RQlmh2ugDIcCYDGQJokTn+xWevFp9gyH8GE6dum7hj6nycUC/7tq1Wz6yZt54fisoG2uYFCZNpDyyNcTjm1EqZd2jEYxoXhOawNgO9U7FhgD4Sq5cHTlkKy2uM/6pCSCaoqJvn1VsPMKEMgelTRSKIRAcOARQcGAJUIqTPEalEUwcs43H/zc3Cx4ngawxyLIMucmQWaN5biTLcrO4sGBvmcv93bvmf/Q9X3nvDxJR9XyufmrxZzk8jqoqrbEtuLKe82xKO5nonTMRWCXy19IGsNaC2wRqCYLzcIMRqlGB4H2EY5nAeQaRYJ7tl3Jhsf1lv/CR06/+q2869Mntx5seBpiI/C99vv+tm928s9YfejbG9piwbAxe2snx0k6Os4MSn7rmsVG5hs83iaFr4uZpipUQqU+VgEiIPk0NRKrqwoUrZ3FHdgdTrLopHXPCSdAx1vaRy48JqFcaz9JQaMESDz2glgVcBqwNoeonPEpsgkXdobFRGUIz82eIYTi6dmZCZi0ya9QyiSELbuVmaXHe7Mi0fNmO+V9+68G9P3n4ZTf/4XvRHKfmX2g5be/ZIxc/OvDrmcl2Gbq+hROgKReiptdfI1TMiVPPClfFQxZUBGQNKLOxDrWErrUYlYQNp3qmaJs/Ojf8pwx87W+v3cbHVPU4oKdOwfxrQHVzc8dPX82/9zPrToWI2ySYhUEbwCIBt3Us9mQWRgPKAGz5EsU20t7kDKE0Z9emjD6OLscmhhtt2Dxfg20BzOOKkMa87xqurQUnpkLMdk8gGrX9vYA5g7a7kK0BDAewYUAZxmbIDWAZyGzM1OumlyUGMSGKZpNaQ8psyNrM9Ho9M9/rYUdLR3s77dW759s/+s77XvHIDyCdVXzkiJx4ATOQ06Ue5jcy2jzfyvNdPBoJVA2l5ohgsptLE2SPaRGkur8ONlBjweyhmQU4InLBR0w2tHPz5GYR9s/Of81P/e6n3/M9b33FT+Bdjei2B4D/8uTwh55sZUtXNoaBM2O6ROgwsJAB+zoEEeDCwOPzWyNcHlXjI1ZqQYha9zfUX0f2jBJByDRJlQaPFtMIMBmSTHkSX4nhInE8fD270FC5dVrVs+nXCkQTeTL4eIKyCihjhCqgnWewbYO5Xgez7VxbrUyZjIJUJ8StyJA1tpVzu52hk7fQtYyc/GBnp/3g3sWZ//KNd+78wK179jyJtOh3HTmiJ/6YBylbIpKf/9zWx9s5v5qcaBvAcHseVqs7TAI7Ey1RJoYkt8XWwORZJMdUwGjo4W2G3s4FiCH0XeAH14vQbc3++L/+yJnWbfPmF1oljTBr913Iu3/tj0LrXZ+5VkpuM6Oq0QUS4eYWsLcVe+lXneJKWc+rhYSp150wTcOS0rj8SGI0E/GeFKpEkI0rA7dFWQYi0usbUnU4kTGNbEIs4Lo5hrocC0mSzVdgCDRjOGbsnpvH4kxbuu0WtzttIhM5/xmbeHo2Axk8LOR8i/nR+V77wX1z3Y+/fP/yH7zl9pueFgDviatujt11Wk98iUfTWwBYavk/vEj4ztlejlERd60mHc86eW7OeKLYEIm1ZjSPYJK+rBiQVTAsqCgxGhToLi9hbmU5UYkFyHO6VlTm08GqmsV/+skrw+83xEUnmEXdNYPPDUpVQ5wbRk6xYVK6OD/YMRZnRg7nhhWuVgGFjyph0ihrpFm1NLXSzK0hgiGagIEoFkFoGbnQFw2U2Wa8mlRiM1prrCNOKQpt0yGaZC1jPKEcaWKJQgaFYUWW5ei2O8gziwO7dnCP/ZXcmrOt3Gx1rb3UtfZs3srPz7VbT9y6q/vUVx289XEi6m+zQDp2/ymDU6fkxImj4QS+9MsCwC4bPvp4f0TBe1P59GQgKcHRCQpjJDdSwus5dfACczz/NLnPMCxQ9IdYuPUmLKwsYzgsQGLAmUVwAtPJ4Zdm6IHRMGTGdto276DyoGsD38ut7TAwz4IZNlCCZuzkc5vezBHBe8EzI4cNF1BOHPMioZ5PS5MrknRyQqyZI+oYF54AIXU8n9vHyvkdB4fGgAynCTNtuojjxHeMel7XQdrOZK07m4ajSgcYi3M9rMzPya7ZLr96ufOe73vHnT+fm8W1UHMMbnQdO8ZvwWH+7uOH9fTx43riBMmJ++DxJ3hZQOnL9uDsHzyydjbLW/upHAihQUMSxFnz73UbTy7SvjiRIUCEalSgKivsvvN2dBcXMNjYBFRhWxZMjOFgC4u7lpG1LCpHJjCrJ4EwUyeI7bHBDANdIrA4vXuuRfO9zFxY6+OBK0OUYvDsSLDlozBBqA8sFIkbIc2o1YkaGmEoGtPPg8KKw627lz63cUXfCLbgqLEG1hrfi7JtVZoQ1m0K3jcaTh2PiY3zAiGCYZaZmRm+qauf+Adf94af/AfNNjlGR1YPUT2ufujyYT1yJGknE8kHcUI+eAL/yy577H4YItp636NXf3NppvttV/p9KScP4NWIn0tNfaJGaKOBqGpgyFcOYMbuO29Hu91Gf3MLCsDmNpIYiwqWgR1L8/A+wBoDw0S5jRasPmDBMjh4tAPr3btadJeR/i2z/K7fXdOf0l5n+cFnN/VK5ajw6bADiUpakk71qnvpoR5ZSpCoEkODAamD+srMkMOtXfPgb/e3vt20suaIkhrQ4kkiiNaNni+gAaDjHKGZIW2kYEjy3PJCL/s4jh3j79z7DvMz73qNA07oyaP433bxocNR7GbGhF/KxVELxEx1jS9j/RrFNnGJaYULUUHeyrBr3x608zZGw1GMq1kOy3GapeiPsGNlAR0T1aByBiwJMii6xqAsA3qq6JGElyywvn4GF17S4ntny/KTL9sx27vQL8UpYSAhJXrpKLfgE+khHukW+96RyEgRyYOqjZoD4hWqNN/mKz9wW//hSk2b8gw1vBv7BmhGwUIjb0IT4kyYULbcNrMwwQDWZDDEjJY1sFI9gRMnZM/BLcWL4OIjCU79q7fv/Hi3HPRbWcZGglLSym1IiROyjLWuLRM33L1WK8fc/BysMahcJKW18hztPIvz6s6DSPVNNy2DXIEOC7oUkIli2RjsyAmiAVU5xFtX2uZVC8y7nfuLQmg9FbLfeeCKa58djPD0qKTSIU6ohjie5L1DCPWQYhmnVVwcUoxC85zYtQGiQYgVu+Z7n9zznp9ab3XaXWKbPFmTvkUtvQldHkm8Rp2QnZ9U8dZmhnBarqZ2mJnJMLu8UOFFdDER6ZFVNUR0ZSHD/1ycmdEWm8CgKOUxqbwxOQ2Taj0mitBjlkfGrkR2ap5l6GVZTAwZ2BxVeP2B3fS6HS0MCofdmUWXCbkqbmtnOJATlizLehVwsOUfnSv9xc0s+6HPb4VPfvSK7P69c+t6vlDe8opB8HA+JEarh7jQ9NDj8EIJDVVUoqB0zlzN5PWqsznjtt1zvz76+E9n3dnuihoCU/ObjUeLh0zVY1uTsO/1yqPPpQNDIBhDhOAwKItzwPS5Qv9bFz/q48RTLW9u08/PW6UOmGwiO9T9Y4iO5dgm7pBrnvtET8Awo2VscwqEiiqsxVv3tJ+41i8HOVusZAYdVbQQcHObsMKEW9qGLgxKnBuq9UL2k0N85f2XhvyhZ67p00WgzcqhcA5VQhO9c+MTsqsyLbyLRMc0pEhkEJAl/p4C3ps9Hdajh+/9wD/7wGgP5b0cmQEYZBWwyYo53abXGuRBOrlaG6F4kjEDZzz7MN1GqIc8QYKqdokvFssHgBP3HQ5Qpa/cP//BXrXxRKedcS4hdAw3R5hhgvokMtnswHWNICZqiIhEhDIIDiy29FU7Omc+dbWkHbkBS0AIHm0QCgesVwG5ZRoWDh++5m//7EB2/NJnL4ePXSv0yVGgK1XAwHs4L3DOwU3MqYUq9dJdFQmOPh7gTESAyRrmnogGzi3dOk9P/JW33vvYBrIFyi2xNWCmKY+miGfjBp3e2Ji4V52YXtbrYv4N5xzoRbf4AOmxUzBEVOxt8Y8vz7SokxntMMOi1tH3TRMj6rwhoWfpGI9EX264bRprhCjGqHRTt02fuEZvvVi5rkqFS2WFLRdHmB7dHOLxfoXz/Qq5ZfzO09f0N57Z1KeGzpwbONooPUZVPFLMVRWC89DKIVQVpHKQqkRwVXT7VWyjQseMmYbOJ6J7Fzs4sDjz/soH9AtvlC0ZW49hx9O/IIlRGwhe4rnC45BHTd9gMgw0/8l2qZgJjMSGF6JJ8qd3NQcpn7iPvKoSHnjg/Z+j/d+33Js7cKG/KUbBJJIkwdJDmBBJUtKGAl1PynrIWNsHQNsS1ivBr5xZ0wpCw5DqbiEMyGPT+3igkAIjBVxQGmwUqFTiAcVpQFF8Ej6q6uGFEj4xZ1COktVXkQyRuIUBBnGSPihZNbd33ejtB3f/4k8DyBe68zSyIGuEidikc3bBms6ji5tYp84Skqku4mTyr9tbx9v5Kg1V8siLyfIbCpWh17zGHZyx/2znbJtyQHNOp9xoSOQFNFyyhteWwJT6kMUQAnwY89hVGZedw5pzNHIBmw7YqAL63mO9crhcelx1AZsuYFh5VN5hoywxLCsUlUNRVXCuhGusu4KUDr508YjSxJeDK0HiYx+CDYRtpEcDUKGwb75HL9+98GvvePvbzgCAbc3Mm3YbzFnE9TmyZijNMHhFSvjqjU/TB0pMjITRBBOXkrRbJGVwM1NgYPAidPvJ+g/fF44dUz5ycOn9c+7K6eVe18wwh6w+cWBCzI9CPLSnPh9+6vjymthYH1wcAkqnKL2g8IrSeZQuoHTxgObCBYycx8h5OOdQVfFVlhVcWSGUFUJVvyJBMpRVnEqtBxdSXc8hDXPwWJpZobBW6dA865vv2PuTtS0Ot0aCBoYl1Ah/7cFcPYKl207YkOmTxHTqbKFplZCxiMiLKtxfv/gg6KHjICIKd870vm/XTBtdBuZsZJ9oOpY8nkmbwJXgI3U5JCKjhOiaEwjjvW947c57OO9Q+TR2XH90Dq6KC+/TyzmHUDmE0sFXDr708OnYUp8mU7Xmy5UVyAVwiJInMdanniwDzOpfsnPBvGyp+2vf9NZX/96RY6s5AJi8BbZZ5MZRFExAmuqNo1lpQ2s9WDFxeMG2U7qQZFqxTQOYkjq3IhoEAJzEyRfh4gM4ShSOrKp5+4H5X9vl+7++e3HRtFjCnDEwGjtlmJL98qCErklSgIrDCqF5xfFi17zEuThu7KIlN98r09eVa6xdygpalJCigBQFQlFAyxG0GELKxI71cR6d0sJzrYDNDGtVl7uW7l6g6r5D+//R5OjhVoFANos6OxSx/Pr4mJDOzK2ZQjJxjtB1bV1MnGaB61ViajLJi+2yN/rmXUegqkpvurTx3Rvni09fzLL22lZf502L1r1HGWRqvl0nZFlrqXU07ZEbACGT8/HN4EUqDdNwREiYPXys2cXFEag4qJhcfVVGTrtEQVbD8WAjm1mQzeBB6LINr7hp2d69w/zE17/hZZ8+sqoGOBkAYHZne9H2MzAZGGJYGlu2F6CaOGJle4mLCb5g/BwT00EyRchsSLGmTveOvChs/4aLf4JIVlXNK3YvfP6/PHb5+9Z58V+vb2w507LZxqgExEemTCNWSHGwQ3ka+arbolPqHnWJVGvpTej9JE14rXOJJCYYF12g3kF9RPGowe5rsU9qDj4ITJhpZZjPM1noztiXzdPn/8k7v/wHP7O6alaPQI4f32kAYK43085LCzZQC4Ktj04TQqEaTxFNciqayr3GA6SFF+jUKVY0iQkkZhARwRjGwkzOL96Yv839r66qOXpw57/Z7y//4qFbb8laqr5lNGX7yRK9iyXWxOx4RN8q+BSffRO30+elgy8L+LKAKwv4Mrn1cgQphgjFEKEcQsthcvG1qx81IgTsPDgd/MvJ1cMYkGVkbOGC11aeySt2tIo37l/4azU5goj04XTihTi9NJNnMKLUSlwFpAy/CPEIWZeOUZV0hq6m8awgIQkepxayThwfX59yUXOzmIk0YKHdHbzo3X5TjR6BnFbldwPf+lMPnNszWlo63C9G3hFsCCGKCwslDECne97pILPm5Mm6EZJAIZk4wSi6zlgdUEinXKUBxbjJfNTw9R4sUWKsJpVwYrrCGJAxmG3nmMlbCGT8S3cvZ/fs7bzrr7z5lX8wOcSweuSIEoBb9y5uLj4ruArlNksqZ+Mkrq+PjE/VSpzLq6VNU0hK4saUxqgjX7DOhyQ1vwALsHqHEsPLwHOrj75oLL+2Ehw/DiLyf+fW9tffng8evmXnil1uZ77NChMCOLhmOgVVfGkVY7KWoyYj12JsufH7Q2gxbD5KES28tv5o7UVTzlFVgX3kwRuqj7QxMMaArYWxBrOdNhY6Le12Wv51d9yUvW6FfvRdb3vVz91gekUB4GV75h5fttrf12tRV1WDD3HRg6IKCpeEq+sSdjKZbU7TSpthPFUby2BOvABLBMsWGXN5cNdSH3hu9dEXleUDwIkTJ2R1ddXQjh2bD5w//7X+XPk/wsryy62quySDbG1UJH1XmsqG63q4PslaJg9irCHi5hwzaciPWs/W1efTi4DTOfXNqDanI07SR1iDmVaOhU5LOnlbD+7dYV/e8z/yfV/9hn98ZHXVbJ9eIYoEzjcTnf9b//kPHqGF3ms2RGQkwahGOLdShfPRtfskihR8LZGSaOqN5GkJ9WXSv6viUKWEeA4PIFne4rbhS19x8OAzDTX8xW75Tfw/ejQcU+V79+49c8Ree/PdneqDd918U7Zvris7O7m0WMHBw/gAdj6NKLmYlLmYE6Aqk6rE2DOgHmIsS6AskoxYFB1gX8F4Bw4epCGKHxIjNxbWxpcxBlmeY7nbw45e1y/Nz/G9B3aaP7cn/yf/4O1v+MffuLpqTh698UTwW06dMgpgroPTM4bVxjmsBptwzsEnOLnRtd3+8hWCK+L9uCiGpD7q3ZIG5AZot6y2c4Md3expw1zh2DEG/gy4/esqgNVVc+DVr17/3i+7/asPmuGPv2Rphu7YtYP3zvb8Qs6aU4DRACsC4wNM8BOL6GBc+jxtDlRxkRGquMghxL8TgU1Hu1nDyCzDZAyTGXDGMJZgc4vZXgcrc11Zmm3JzXv32lftnn/6q26e/cbveMsrf+gtx+63ceFvrPF7OH1caXd+rw2QER/n6Z2L83YhxAaSS0qXdT+hqj8vIK4AXBE3eVVFXZwQwBpPPLKcYabb1vleF7Mt+h1RxbHDh/nPRMJ3Iw+QRqtLAN/3nz7x5K8+2eZ/szRz80ufvvgsrmxs+LXhyAxLT05COhhB0oFFaaypPum65sTptIgym5oBw42KRjMbyAxrDToti17eCd0sw46FBbN3oYVbu+bn3rkL//DgPS+9HLVnnmdeLc0Kvu223n+/+OTGj4nnOSqdZllGo+AhXhtRY++Ti/chfqwRxrToSBIpcC56KRIYk0fZWTbcI+8PrCyefDEROQD88QBnVaXjp06ZE/fd5/XKY3P/4cns739uffR3rgS7ePbKVaxv9v2gLGhUOi5cIO8DQlKxaIhwDTNImqng5iCECVEnpig3kluDVpZpu5VJLzO8tLBIy7Nd7Gubj71qz8z3v/Oe238bAJ5LheJGV/27P3HqsR97yMy/9+pg5K+ORvbaqEThBFXwcC7RxKoylnUuxM/TwmsSRCKfBjJVwEzodruwufF7V3aZVy/nv/Wzf+Nrvvr/PKZ84gTJn0nLn0qYAH9kddXQjoObAI5/5pln3v/hM4PvWaa5b97aubz3/FYfWxsbGBTOF85hVJZcOE9elCTEzRBBoUm6Y5oJ4DismBvWls2lZa3mGXO30+bFuTmzkCt2dPMPvWSh87Pf9vqX/kcikiO14NAXMbp0+vRxhSq95cyZn7zy1PDda0Ha5WikcJ7IJS2cygGlg5SjmLwGSdVHGS3du0gX0wAmAZMBG0ZugZluF/sXO3T3js6PKIBDh06+qLo7X/KbUVU6CfDR9NBVN3f84qev/eUnrvSPXBuWry+53dooBP3BAP1iiLJy6l0QL16DhnhqVr34BFg2sGzZGuJOu4Vuu4vZbhtdI5izcnHXfOc3b17o/Nw3veK2D4bGgqenfb+Yq5Yn++kPPfS3T2Phpz594aq7Nhhkm2WkiLkqdhb9aAAyFiEIUMQ4Xze5OJ1ExjVTt51httdxt+y7KXvNYv6BHzv6lq/7flH+YgcpX/SLPxUKjp8y9Ww4A/jQY2duP3159NUXhu4N/bK6Z1hWtwTYnretKGYYAFHfaCAxMywzchFQKJGznl/stj+33Ms+ftPi3O9848v3f4yI1mvweHUVfPQoyZeaPdc4wIn7H3r/OVr6tkfOPF1d7g+yQVGRqypUroSMRiCbw/sQqxNJWX06vyYexsBotTLMdNtuZeeu7LW7eo+/58+/6k17fvzHrxxLZfP/Lxf/+nzgcJjMtFWVPnTmzO5Hz27cshVk/9DJ/iA8P2N5lxMGkQhTeHqmk13J2Ty9ODdz/i/d2XqKaVdft1nqkZR8/km+56MnT/LqkSP0I/ef/oVnZOavPPrMeVza2vL9/sCMqoq0dDBZBuc81JWNTo6hmKRmRGjZPPS6bezbu8fcvdx64p137fjz995xx+Npbv5F19r7XxqDjh1TxuFT/PDlw3ryKP0xF+sYH7v/MKdRJnm+41m+lA1A8exa/ZcfOv3ex/v6Q+cqap27fBlr19a0Kkttdzo0GhUI3hEFUSaFMaQZW7TyFi8szmPvbAcvXcx/+a/ec/O7D+zadVE1Kly/GFu6f5oJCKkqjp48yc91lGp9Hbp8WE8fgR6PM2t/aqVRvQEA0t975MmXfexi/7ufGYR3XOmXtwxCxPlHgwGqqopTSAy08wzdLMeMDeVyO//NA0u9f/ndh1/xW4JGKePF2cz/U178PzPXkVU1tadSXV/8uY89+7arLrxzWIXXDoblPEOXXJBrNjMbMxk/Nmf5/rt3zv7G2+6+7VNNM1uf/xCp/93X/wfko9SVoLv9JwAAAABJRU5ErkJggg==" alt="레벨업 과외 로고" /></span>
      레벨업 과외
    </a>
    <nav>
      <ul class="nav-links" id="navLinks">
        <li class="has-dd"><details class="hdd"><summary>수업 과목</summary><div class="hsub"><a href="/korean">국어</a><a href="/english">영어</a><a href="/math">수학</a><a href="/social">사회</a><a href="/science">과학</a></div></details></li>
        <li><a href="#how">수업 방식</a></li>
        <li><a href="#reviews">수강 후기</a></li>
        <li class="m-cta"><a class="btn btn-primary" href="#contact">무료 상담 신청</a></li>
      </ul>
    </nav>
    <div class="nav-cta">
      <a class="btn btn-primary" href="#contact">무료 상담 신청</a>
      <button class="hamburger" id="hamburger" aria-label="메뉴 열기" aria-expanded="false"><span></span></button>
    </div>
  </div>
</header>

<!-- ══════════ 히어로 ══════════ -->
<section class="hero">
  <span class="balloon b-a" aria-hidden="true"></span>
  <span class="balloon y b-b" aria-hidden="true"></span>
  <div class="wrap hero-grid">
    <div>
      <span class="pill-tag"><span class="dot"></span>초 · 중 · 고 전과목 1:1 과외</span>
      <h1>지금 그 자리에서,<br>한 단계 <span class="pop">위로.</span></h1>
      <p class="lead">국어·영어·수학·사회·과학, 그리고 고등 선택·탐구과목까지. 학생 한 명 한 명의 막힌 부분을 정확히 진단하고, 다음 레벨로 올라가는 가장 빠른 길을 함께 찾습니다.</p>
      <div class="hero-cta">
        <a class="btn btn-primary" href="#contact">무료 상담 신청하기</a>
        <a class="btn btn-soft" href="#subjects">수업 과목 보기</a>
      </div>
      <div class="hero-meta">
        <div class="stat"><div class="num">5과목</div><div class="lbl">국·영·수·사·과 전 과목</div></div>
        <div class="stat"><div class="num">초·중·고</div><div class="lbl">전 학년 1:1 맞춤</div></div>
        <div class="stat"><div class="num">선택·탐구</div><div class="lbl">고등 입시과목 대응</div></div>
      </div>
    </div>

    <!-- 시그니처: 부풀며 쌓이는 레벨 -->
    <div class="levelup" aria-hidden="true">
      <span class="balloon lb1"></span>
      <span class="balloon y lb2"></span>
      <div class="lu-head"><span class="t">Progress</span><span class="m">LV.1 → LV.3 ↑</span></div>
      <div class="lu-stage">
        <div class="lu-block b1"><span class="lv">LV.1</span><span class="g">초등</span></div>
        <div class="lu-block b2"><span class="lv">LV.2</span><span class="g">중등</span></div>
        <div class="lu-block b3">
          <div class="lu-topper"><span class="star">★</span><span class="lbl">LEVEL UP!</span></div>
          <span class="lv">LV.3</span><span class="g">고등</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════ 강점 ══════════ -->
<section class="section" id="why">
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow">Why Level Up</span>
      <h2>왜 레벨업 레슨일까요</h2>
      <p>점수를 올리는 비결은 특별한 비법이 아니라, 막힌 곳을 정확히 찾아 끝까지 책임지는 과정에 있습니다.</p>
    </div>
    <div class="strengths">
      <div class="scard reveal">
        <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 12 12 7"/><path d="M12 12 15 14"/></svg></div>
        <h3>전과목 1:1 맞춤</h3>
        <p>국어·영어·수학·사회·과학 모두, 학생의 수준과 목표에 딱 맞춰 일대일로 진행합니다.</p>
      </div>
      <div class="scard reveal">
        <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16"/><path d="M7 19V9"/><path d="M12 19V5"/><path d="M17 19v-7"/></svg></div>
        <h3>초등부터 고등까지</h3>
        <p>기초 학습 습관을 잡는 초등부터 입시를 준비하는 고등까지, 전 과정을 이어서 관리합니다.</p>
      </div>
      <div class="scard reveal">
        <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 3Z"/></svg></div>
        <h3>입시 선택·탐구과목 대응</h3>
        <p>고등 선택과목과 사회·과학 탐구과목까지, 입시 전략에 맞춰 전문적으로 지도합니다.</p>
      </div>
      <div class="scard reveal">
        <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg></div>
        <h3>체계적인 학습 관리</h3>
        <p>진도와 성적, 과제 수행까지 꼼꼼히 기록하고 점검해 꾸준한 성장을 만듭니다.</p>
      </div>
    </div>
  </div>
</section>

<!-- ══════════ 과목 (레벨 티어) ══════════ -->
<section class="section panel-white" id="subjects">
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow">Subjects · 수업 과목</span>
      <h2>학년이 오를수록, 함께 레벨업</h2>
      <p>초등 기초 개념부터 고등 입시까지. 각 단계에 꼭 필요한 과목을 빠짐없이 다룹니다.</p>
    </div>
    <div class="tiers">
      <!-- 초등 -->
      <div class="tier t1 reveal">
        <div class="badge">
          <span class="lvchip">LEVEL 1</span>
          <span class="grade">초등</span>
          <span class="desc">개념과 학습 습관 다지기</span>
        </div>
        <div class="chips">
          <a class="chip" href="/korean">국어</a><a class="chip" href="/english">영어</a><a class="chip" href="/math">수학</a>
          <a class="chip" href="/social">사회</a><a class="chip" href="/science">과학</a>
        </div>
      </div>
      <!-- 중등 -->
      <div class="tier t2 reveal">
        <div class="badge">
          <span class="lvchip">LEVEL 2</span>
          <span class="grade">중등</span>
          <span class="desc">내신·서술형 대비</span>
        </div>
        <div class="chips">
          <a class="chip" href="/korean">국어</a><a class="chip" href="/english">영어</a><a class="chip" href="/math">수학</a>
          <a class="chip" href="/social">사회</a><a class="chip" href="/science">과학</a>
        </div>
      </div>
      <!-- 고등 (정상) -->
      <div class="tier t3 reveal">
        <div class="badge">
          <span class="lvchip">LEVEL 3</span>
          <span class="grade">고등</span>
          <span class="desc">내신 + 수능·입시 대비</span>
        </div>
        <div>
          <div class="grp">
            <div class="grp-label">공통 · 기본 과목</div>
            <div class="chips"><a class="chip" href="/korean">국어</a><a class="chip" href="/english">영어</a><a class="chip" href="/math">수학</a></div>
          </div>
          <div class="grp">
            <div class="grp-label">선택과목</div>
            <div class="chips"><a class="chip hl" href="/calculus">미적분</a><a class="chip hl" href="/geometry">기하</a><a class="chip hl" href="/statistics">확률과 통계</a><a class="chip hl" href="/language-media">언어와 매체</a><a class="chip hl" href="/literature">문학·독서</a></div>
          </div>
          <div class="grp">
            <div class="grp-label">탐구과목 (사탐 · 과탐)</div>
            <div class="chips"><a class="chip" href="/ethics">생활과 윤리</a><a class="chip" href="/society-culture">사회·문화</a><a class="chip" href="/korea-geography">한국지리</a><a class="chip" href="/physics">물리학</a><a class="chip" href="/chemistry">화학</a><a class="chip" href="/biology">생명과학</a><a class="chip" href="/earth-science">지구과학</a></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════ 수업 방식 ══════════ -->
<section class="section" id="how">
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow">How it works · 수업 방식</span>
      <h2>레벨업으로 가는 4단계</h2>
      <p>막연한 ‘열심히’가 아니라, 진단부터 관리까지 이어지는 분명한 흐름으로 진행합니다.</p>
    </div>
    <div class="steps">
      <div class="step reveal"><span class="no">1</span><h3>레벨 진단</h3><p>현재 실력과 정확히 어디서 막히는지를 먼저 꼼꼼히 파악합니다.</p></div>
      <div class="step reveal"><span class="no">2</span><h3>맞춤 커리큘럼</h3><p>학년·목표·약점에 맞춰 학생만을 위한 학습 계획을 설계합니다.</p></div>
      <div class="step reveal"><span class="no">3</span><h3>1:1 집중 수업</h3><p>모르는 부분은 넘어가지 않고, 이해할 때까지 책임지고 가르칩니다.</p></div>
      <div class="step reveal"><span class="no">4</span><h3>피드백 & 관리</h3><p>수업 리포트와 과제 점검으로 성장을 눈으로 확인하게 합니다.</p></div>
    </div>
  </div>
</section>

<!-- ══════════ 후기 (예시 — 실제 후기로 교체하세요) ══════════ -->
<section class="section panel-white" id="reviews">
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow">Reviews · 수강 후기</span>
      <h2>학생과 학부모님의 이야기</h2>
      <p>점수의 변화보다 먼저, 공부를 대하는 태도가 달라집니다.</p>
    </div>
    <div class="reviews">
      <div class="review reveal">
        <div class="stars">★★★★★</div>
        <p class="quote">“어디서 막히는지 정확히 짚어주셔서, 수학이 4등급에서 2등급으로 올랐어요. 아이가 스스로 풀어보려는 태도가 생긴 게 가장 큰 변화예요.”</p>
        <div class="who"><span class="av">김</span><div><b>고2 학부모</b><span>수학 · 6개월 수강</span></div></div>
      </div>
      <div class="review reveal">
        <div class="stars">★★★★★</div>
        <p class="quote">“초등 아이라 습관이 걱정이었는데, 매주 학습 점검을 챙겨주시니 혼자서도 공부하는 루틴이 잡혔어요.”</p>
        <div class="who"><span class="av">이</span><div><b>초5 학부모</b><span>국어·영어 · 4개월 수강</span></div></div>
      </div>
      <div class="review reveal">
        <div class="stars">★★★★★</div>
        <p class="quote">“탐구과목 개념이 늘 헷갈렸는데, 흐름을 잡아주셔서 정리가 확실히 됐어요. 모의고사 등급이 안정적으로 올랐습니다.”</p>
        <div class="who"><span class="av">박</span><div><b>고3 학생</b><span>생활과 윤리·사회문화</span></div></div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════ 상담 문의 ══════════ -->
<section class="section" id="contact">
  <div class="wrap">
    <div class="contact-panel reveal">
      <span class="balloon cb1" aria-hidden="true"></span>
      <span class="balloon cb2" aria-hidden="true"></span>
      <div class="contact-grid">
        <div class="contact-aside">
          <span class="eyebrow">Contact · 상담 문의</span>
          <h2>먼저, 무료 상담부터</h2>
          <p>학생의 현재 상황과 목표를 듣고, 어떤 과목을 어떻게 시작하면 좋을지 함께 정해드립니다. 부담 없이 남겨주세요.</p>
          <div class="contact-quick">
            <!-- ▼ 연락처를 실제 정보로 바꿔주세요 -->
            <a class="qrow" href="tel:01030388978">
              <span class="qic"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z"/></svg></span>
              <span><span class="ql">전화 상담</span><span class="qv">010-3038-8978</span></span>
            </a>
          </div>
        </div>

        <div class="form-card">
          <form id="inquiryForm" novalidate>
            <div class="form-row">
              <div class="field"><label for="name">학생 이름 <span class="req">*</span></label><input id="name" name="name" type="text" placeholder="학생 이름" required /></div>
              <div class="field"><label for="phone1">학부모 연락처 <span class="req">*</span></label>
                <div class="phone-3">
                  <input id="phone1" type="tel" inputmode="numeric" maxlength="3" placeholder="010" />
                  <span class="phone-sep">-</span>
                  <input id="phone2" type="tel" inputmode="numeric" maxlength="4" placeholder="0000" />
                  <span class="phone-sep">-</span>
                  <input id="phone3" type="tel" inputmode="numeric" maxlength="4" placeholder="0000" />
                </div>
              </div>
            </div>
            <div class="field">
              <label for="grade">학생 학년</label>
              <select id="grade" name="grade">
                <option value="">선택해주세요</option>
                <optgroup label="초등"><option>초1</option><option>초2</option><option>초3</option><option>초4</option><option>초5</option><option>초6</option></optgroup>
                <optgroup label="중등"><option>중1</option><option>중2</option><option>중3</option></optgroup>
                <optgroup label="고등"><option>고1</option><option>고2</option><option>고3</option><option>재수·N수</option></optgroup>
                <optgroup label="기타"><option>성인</option></optgroup>
              </select>
            </div>
            <div class="field">
              <label>희망 과목</label>
              <div class="subj-pick">
                <label><input type="checkbox" name="subject" value="국어">국어</label>
                <label><input type="checkbox" name="subject" value="영어">영어</label>
                <label><input type="checkbox" name="subject" value="수학">수학</label>
                <label><input type="checkbox" name="subject" value="사회">사회</label>
                <label><input type="checkbox" name="subject" value="과학">과학</label>
                <label><input type="checkbox" name="subject" value="선택·탐구">선택·탐구</label>
              </div>
            </div>
            <div class="field full">
              <label for="postcode">주소 <span class="req">*</span></label>
              <div class="addr-row">
                <input id="postcode" name="postcode" type="text" placeholder="우편번호" readonly />
                <button type="button" id="addrSearch" class="addr-btn">주소 찾기</button>
              </div>
              <input id="addrRoad" name="addrRoad" type="text" placeholder="도로명 주소" readonly />
              <input id="addrDetail" name="addrDetail" type="text" placeholder="상세주소 (동·호수 등)" required />
            </div>
            <div class="field full"><label for="message">문의 내용</label><textarea id="message" name="message" placeholder="현재 성적, 고민, 원하는 수업 방식 등을 자유롭게 적어주세요."></textarea></div>
            <button type="submit" class="btn btn-primary">상담 신청하기</button>
            <p class="form-note">남겨주신 정보는 상담 안내 목적으로만 사용됩니다.</p>
          </form>
          <div class="form-success" id="formSuccess">
            <div class="ok"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg></div>
            <h3>신청이 접수되었어요!</h3>
            <p>확인 후 빠르게 연락드리겠습니다. 감사합니다.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════ 푸터 ══════════ -->
<footer>
  <div class="wrap foot">
    <div class="foot-brand"><strong>레벨업과외</strong><span>초·중·고 1:1 맞춤 과외</span></div>
    <nav class="foot-links">
      <a href="#subjects">수업 과목</a>
      <a href="#how">수업 방식</a>
      <a href="#contact">상담 문의</a>
      <a href="/regions">전국 지역 안내</a>
      <a href="tel:01030388978">010-3038-8978</a>
    </nav>
    <div class="foot-copy">© {{YEAR}} 레벨업과외 · level-up-lesson.com</div>
  </div>
</footer>

<script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
<script>
  const header = document.getElementById('top');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  const burger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open'); burger.setAttribute('aria-expanded', false);
  }));

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:0.12});
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    // 풍선 둥실 효과
    document.querySelectorAll('.balloon').forEach((b,i) => {
      b.style.animation = \`bob \${3.4 + (i%3)*0.7}s ease-in-out \${i*0.4}s infinite\`;
    });
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }

  const form = document.getElementById('inquiryForm');
  const success = document.getElementById('formSuccess');
  const byId = (id) => document.getElementById(id);

  // 전화번호: 3-4-4 세 칸, 다 채우면 다음 칸으로 자동 이동 (지우면 이전 칸으로)
  const phoneParts = ['phone1', 'phone2', 'phone3'].map(byId);
  phoneParts.forEach((el, i) => {
    el.addEventListener('input', () => {
      el.value = el.value.replace(/\D/g, '').slice(0, el.maxLength);
      if (el.value.length >= el.maxLength && i < phoneParts.length - 1) phoneParts[i + 1].focus();
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && el.value === '' && i > 0) phoneParts[i - 1].focus();
    });
  });

  // 주소 찾기 (다음 우편번호 → 도로명주소)
  byId('addrSearch').addEventListener('click', () => {
    if (typeof daum === 'undefined' || !daum.Postcode) { alert('주소 검색을 불러오지 못했어요. 잠시 후 다시 시도해주세요.'); return; }
    new daum.Postcode({
      oncomplete: (d) => {
        byId('postcode').value = d.zonecode || '';
        byId('addrRoad').value = d.roadAddress || d.address || '';
        byId('addrDetail').focus();
      }
    }).open();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = form.elements;
    const name = f['name'].value.trim();
    const p1 = phoneParts[0].value, p2 = phoneParts[1].value, p3 = phoneParts[2].value;
    const road = byId('addrRoad').value.trim();
    const detail = byId('addrDetail').value.trim();

    if (!name){ f['name'].focus(); alert('학생 이름을 입력해주세요.'); return; }
    if (p1.length !== 3 || p2.length !== 4 || p3.length !== 4){
      (p1.length !== 3 ? phoneParts[0] : p2.length !== 4 ? phoneParts[1] : phoneParts[2]).focus();
      alert('학부모 연락처를 정확히 입력해주세요. (예: 010-1234-5678)'); return;
    }
    if (!road){ byId('addrSearch').focus(); alert('주소 찾기로 도로명 주소를 선택해주세요.'); return; }
    if (!detail){ byId('addrDetail').focus(); alert('상세주소를 입력해주세요.'); return; }

    const phone = p1 + '-' + p2 + '-' + p3;
    const address = '[' + (byId('postcode').value.trim() || '-') + '] ' + road + ', ' + detail;
    const subjects = [...form.querySelectorAll('input[name="subject"]:checked')].map(c => c.value);
    const payload = { name, phone, grade: f['grade'].value, subjects, address, message: f['message'].value.trim() };
    const btn = form.querySelector('button[type="submit"]');
    const label = btn.textContent; btn.disabled = true; btn.textContent = '보내는 중...';
    try {
      const res = await fetch('/api/inquiry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) throw new Error(out.error || '잠시 후 다시 시도해주세요.');
      form.style.display = 'none';
      success.classList.add('show');
      success.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'center'});
    } catch (err) {
      alert('전송 중 문제가 발생했어요. ' + err.message);
      btn.disabled = false; btn.textContent = label;
    }
  });
</script>
<script>(function(){var ok=function(e){var t=e.target;return t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);};document.addEventListener('contextmenu',function(e){if(!ok(e))e.preventDefault();});document.addEventListener('dragstart',function(e){if(!ok(e))e.preventDefault();});document.addEventListener('copy',function(e){if(!ok(e))e.preventDefault();});document.addEventListener('keydown',function(e){var k=(e.key||'').toLowerCase();if(e.key==='F12'){e.preventDefault();return;}if(e.ctrlKey&&e.shiftKey&&['i','j','c'].indexOf(k)>-1){e.preventDefault();return;}if(e.ctrlKey&&!ok(e)&&['u','s'].indexOf(k)>-1){e.preventDefault();return;}});})();</script>
</body>
</html>
`;

const FAVICON_ICO = "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";
const APPLE_ICON = "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";

function b64ToBytes(b64) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function handleInquiry(request, env) {
  let data;
  try { data = await request.json(); }
  catch { return json({ ok: false, error: "요청 형식이 올바르지 않습니다." }, 400); }

  const name = (data.name || "").toString().trim();
  const phone = (data.phone || "").toString().trim();
  const address = (data.address || "").toString().trim();
  if (!name || !phone || !address) {
    return json({ ok: false, error: "학생 이름, 학부모 연락처, 주소를 입력해주세요." }, 400);
  }

  const atDisplay = new Date().toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  const record = {
    site: env.SITE_NAME || "레벨업과외",
    name,
    phone,
    address,
    grade: (data.grade || "").toString(),
    subjects: Array.isArray(data.subjects) ? data.subjects : [],
    message: (data.message || "").toString().trim(),
    at: new Date().toISOString(),
    atDisplay,
  };

  // ───────── 1) 이메일 알림 발송 (Cloudflare Email Routing) ─────────
  // env.NOTIFY(send_email 바인딩) + env.NOTIFY_TO(받는 메일)가 설정돼 있으면
  // 새 문의마다 HTML 카드형 알림 메일을 보냅니다. 없으면 건너뜁니다.
  try {
    if (env.NOTIFY && env.NOTIFY_TO) {
      const to = env.NOTIFY_TO;
      const from = env.NOTIFY_FROM || "noreply@level-up-lesson.com";
      const subjLabel = record.subjects.length ? record.subjects.join("·") + " " : "";
      const subject = "[레벨업과외] " + subjLabel + "상담 신청 - " + name;
      const raw = buildMime({ from, fromName: "레벨업과외", to, subject, html: renderEmailHtml(record) });
      await env.NOTIFY.send(new EmailMessage(from, to, raw));
      console.log("상담 알림 메일 발송 성공 →", to);
    } else {
      console.log("상담 알림 메일 건너뜀 (설정 누락) - NOTIFY바인딩:", !!env.NOTIFY, "/ NOTIFY_TO:", !!env.NOTIFY_TO);
    }
  } catch (e) {
    console.log("상담 알림 메일 발송 실패:", e && e.message ? e.message : e);
  }

  // ───────── 2) 구글 시트 기록 (Apps Script 웹앱) ─────────
  // env.SHEET_WEBHOOK_URL 이 설정돼 있으면 문의 한 건을 시트에 한 줄로 추가합니다.
  try {
    if (env.SHEET_WEBHOOK_URL) {
      await fetch(env.SHEET_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(record),
      });
    }
  } catch (e) {
    console.log("구글 시트 기록 실패:", e && e.message ? e.message : e);
  }

  console.log("새 상담 신청:", JSON.stringify(record));
  // ──────────────────────────────────────────────────────────────

  return json({ ok: true });
}

// UTF-8 문자열을 RFC 2047 인코딩 워드(=?UTF-8?B?...?=)로 변환 — 한글 제목/이름용
function encodeWord(s) {
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(s)));
  return "=?UTF-8?B?" + b64 + "?=";
}

// 사용자 입력을 HTML에 안전하게 넣기 위한 이스케이프
function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 상담 신청 알림 메일 본문(HTML 카드) 생성
function renderEmailHtml(r) {
  const tel = String(r.phone).replace(/[^0-9+]/g, "");
  const subjects = r.subjects.length ? r.subjects.join(", ") : "-";
  const grade = r.grade || "-";
  const message = r.message ? escapeHtml(r.message).replace(/\n/g, "<br>") : "-";
  const sky = "#15A3E6", ink = "#0E3550", line = "#EAEFF3", soft = "#EAF7FE";

  const cell = "padding:14px 0;font-size:14px;color:#7C8A99;width:104px;vertical-align:top;";
  const val = "padding:14px 0;font-size:15px;font-weight:700;color:" + ink + ";border-bottom:1px solid " + line + ";";
  let rows = [
    ["학생 이름", escapeHtml(r.name)],
    ["학년", escapeHtml(grade)],
    ["희망 과목", escapeHtml(subjects)],
  ].map(function (kv) {
    return '<tr><td style="' + cell + '">' + kv[0] + '</td><td style="' + val + '">' + kv[1] + '</td></tr>';
  }).join("");

  rows += '<tr><td style="' + cell + '">📞 학부모 연락처</td>' +
    '<td style="padding:14px 0;border-bottom:1px solid ' + line + ';">' +
    '<a href="tel:' + tel + '" style="color:' + sky + ';font-size:17px;font-weight:800;text-decoration:none;">' + escapeHtml(r.phone) + '</a></td></tr>';

  rows += '<tr><td style="' + cell + '">📍 주소</td>' +
    '<td style="' + val + '">' + escapeHtml(r.address || "-") + '</td></tr>';

  rows += '<tr><td style="' + cell + '">문의 내용</td>' +
    '<td style="padding:14px 0;font-size:15px;line-height:1.6;color:' + ink + ';">' + message + '</td></tr>';

  return '<!doctype html><html><body style="margin:0;padding:24px 12px;background:#F3F7FA;' +
    'font-family:-apple-system,BlinkMacSystemFont,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;' +
    'background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(14,53,80,.10);">' +
    '<tr><td style="background:' + sky + ';padding:30px 32px;">' +
    '<div style="color:#CDEEFB;font-size:13px;font-weight:700;letter-spacing:.5px;margin-bottom:6px;">레벨업과외 · 새 문의</div>' +
    '<div style="color:#ffffff;font-size:23px;font-weight:800;">📞 새 상담 신청이 도착했습니다</div></td></tr>' +
    '<tr><td style="padding:8px 32px 4px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + rows + '</table></td></tr>' +
    '<tr><td style="padding:18px 32px 26px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + soft + ';border-left:4px solid ' + sky + ';border-radius:10px;">' +
    '<tr><td style="padding:16px 18px;">' +
    '<div style="color:' + ink + ';font-size:14px;font-weight:700;margin-bottom:12px;">⏰ 빠른 연락이 상담 성사율을 높여요</div>' +
    '<a href="tel:' + tel + '" style="display:inline-block;background:' + sky + ';color:#ffffff;font-size:15px;font-weight:800;text-decoration:none;padding:11px 22px;border-radius:10px;">📞 전화 걸기</a>' +
    '</td></tr></table></td></tr>' +
    '<tr><td style="padding:16px 32px 26px;border-top:1px solid ' + line + ';text-align:center;">' +
    '<span style="color:#9AA8B5;font-size:12px;">level-up-lesson.com · 신청 시각: ' + escapeHtml(r.atDisplay) + '</span>' +
    '</td></tr></table></body></html>';
}

// 한글 HTML 메일이 안전하게 전달되도록 base64 인코딩한 MIME 메시지를 만듭니다.
function buildMime({ from, fromName, to, subject, html }) {
  const fromHeader = fromName ? encodeWord(fromName) + " <" + from + ">" : from;
  const b64body = btoa(String.fromCharCode(...new TextEncoder().encode(html)));
  const wrapped = (b64body.match(/.{1,76}/g) || [b64body]).join("\r\n");
  const headers = [
    "From: " + fromHeader,
    "To: " + to,
    "Subject: " + encodeWord(subject),
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: base64",
  ];
  return headers.join("\r\n") + "\r\n\r\n" + wrapped + "\r\n";
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "POST" && path === "/api/inquiry") {
      return handleInquiry(request, env);
    }
    if (path === "/favicon.ico") {
      return new Response(b64ToBytes(FAVICON_ICO), {
        headers: { "content-type": "image/x-icon", "cache-control": "public, max-age=604800" },
      });
    }
    if (path === "/apple-touch-icon.png") {
      return new Response(b64ToBytes(APPLE_ICON), {
        headers: { "content-type": "image/png", "cache-control": "public, max-age=604800" },
      });
    }
    if (path === "/robots.txt") {
      let body = "User-agent: *\nAllow: /\n\nSitemap: https://level-up-lesson.com/sitemap.xml\n";
      if (env.DAUM_VERIFY) body += "\n" + env.DAUM_VERIFY + "\n"; // 다음 웹마스터도구 PIN 코드 줄
      return new Response(body, {
        headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=86400" },
      });
    }
    const SM_CHUNK = 45000;
    if (path === "/sitemap.xml") {
      const total = seoSitemapPaths().length + 1;
      const n = Math.ceil(total / SM_CHUNK);
      let body = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      for (let i = 1; i <= n; i++) body += '<sitemap><loc>https://level-up-lesson.com/sitemap-' + i + '.xml</loc></sitemap>\n';
      body += '</sitemapindex>\n';
      return new Response(body, {
        headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=86400" },
      });
    }
    if (path.startsWith("/sitemap-") && path.endsWith(".xml")) {
      const i = parseInt(path.slice(9, -4), 10);
      const all = ["/"].concat(seoSitemapPaths());
      if (!i || i < 1 || (i - 1) * SM_CHUNK >= all.length) {
        return new Response("Not Found", { status: 404 });
      }
      const slice = all.slice((i - 1) * SM_CHUNK, i * SM_CHUNK);
      let urls = "";
      for (const p of slice) {
        const loc = p === "/" ? "https://level-up-lesson.com/" : "https://level-up-lesson.com" + p;
        const pr = p === "/" ? "1.0" : "0.7";
        urls += '<url><loc>' + loc + '</loc><changefreq>monthly</changefreq><priority>' + pr + '</priority></url>\n';
      }
      const body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '</urlset>\n';
      return new Response(body, {
        headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=86400" },
      });
    }
    if (path === "/" || path === "/index.html") {
      // 동적 생성: 요청 시점 기준 값 주입 (예: 연도). 필요한 값을 여기서 더 끼워 넣으면 됩니다.
      const year = new Date().getFullYear();
      const verify = [
        env.GOOGLE_SITE_VERIFICATION ? '<meta name="google-site-verification" content="' + env.GOOGLE_SITE_VERIFICATION + '" />' : '',
        env.NAVER_SITE_VERIFICATION ? '<meta name="naver-site-verification" content="' + env.NAVER_SITE_VERIFICATION + '" />' : '',
        env.BING_SITE_VERIFICATION ? '<meta name="msvalidate.01" content="' + env.BING_SITE_VERIFICATION + '" />' : '',
      ].filter(Boolean).join("\n");
      const page = HTML.replaceAll("{{YEAR}}", String(year)).replace("{{VERIFY}}", verify);
      return new Response(page, {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" },
      });
    }
    const seoPage = tryRenderSeoPage(path);
    if (seoPage) {
      return new Response(seoPage, {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600" },
      });
    }
    return new Response("Not Found", { status: 404 });
  },
};
