// 레벨업과외 — Cloudflare Worker
// 요청마다 페이지를 동적으로 생성·서빙하고, 상담 신청(/api/inquiry)을 처리합니다.
// 배포:  npx wrangler deploy   (자세한 내용은 README.md / wrangler.toml 참고)

// 상담 신청 시 이메일 알림 발송용 (Cloudflare Email Routing)
import { EmailMessage } from "cloudflare:email";

const HTML = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>레벨업과외 · 초·중·고 전과목 1:1 과외</title>
<meta name="description" content="국어·영어·수학·사회·과학, 고등 선택·탐구과목까지. 학생의 현재 레벨에서 시작하는 초·중·고 1:1 맞춤 과외." />
<link rel="icon" type="image/png" sizes="32x32" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFlklEQVR4nMVXTWxcVxX+znk/M5kZZ8Z/gcRpbcWkbZKGtpDQqjYNQgLxIxBFQgKE2LBA6oodEjsk9o3YgWABGxaAYI/aitZQk1ilcciPJ67dOHEynp839njmvXnv3XsOi3GQa08cA6r7Lc87et93zj33nHsIfTAy+kntZ/9/Ua/N007bBwwfFvFeQvigyXdy8UGT7xTBj3L8sEEfRfTb4e71kYiEmEQVrCK8ZVRmEgWgVhlQAgBiFqKevQclFWWo7qr8fQkgIlVV7pEAACmgBFUSq842TyUmVRHWfkfKZCHb/fcjoEdOmaHhytFnzr7fvrNarC/eOtWLns3Hzp2/QsaieuWdZ42xropSaXJyYeTMmSoXSjaNEwrv3sm2rr17Mmp3hkAsUOlbb7tqgJhFVWnwxOTCj377iyMLmZGht8pVtH/+szebs3996duvvjo39uXPn/vTrQjhH34z2/zdr56Z+vFP3nnq5W9MLaaMIAWMBdIoRvj+UmPj1xdvBpdnp4hYtI+IXRkgJqtGvE989evV0eMjT/3+zdvh9ZUgN3DsyVJ+5NrasakL51bvbNiF5QpJduT05Le+f+l7r3zzwmvzgb52q2pt2DZeJkOHi0WnmysNe995ZWpg7f7VzZXbZ4nJ6o7j2CVAtXfm2dEjmb+vqq60YxfNJtJ2x7Lr2mvNTVmP1XHSBK21AJ2nT50oV8T+sVyh6vx11zFwkc8DJxn5gVzaUNcb/PR0hJXb6HfddqVEtdee3YHCoZZRiuMEmlq4cdSNg2DYJEmXmWGtBdLE0dT6K11yok4IDhMUr/7trfy1S7Ol4iAmSnlO466GheJx33WSfsW4uzC2rps/UMzHaYrUpCAFnLCdJEmSsZ0wBDsgVUDhiBEvNgbsZ9j1M4bmXv9s/sY/xs6f/DieyLnaTVKy1mbJc+M+Ceh/CzzP73K+UOgkKcQKSBUcdyAAbBRFVHIAKBTgRMQ1CuRzWTWTE27huz+cmfzMc6Xni3jsz3cjsu2WOmG7bZJ0bN8CHN9NreN5YWIgCiJVUBIxAJgkTkAARJWIVEQgCgwXDqEwkIf/qR9MP1n0MLPcxNvvVcRr1h0/WLsbWnkcRAaq7iMFqCjb1EjiKhxmEBHIGgaThap4RFCxgAgUQCyC2Fg0NjeRrqwmt1WxsbHJcv+uN2o2rdycH0avZdLOQuwrwMTdbNJuB2m2BNdzFJksrJM1EHXyg4Ml2BTGCkGMIeY4tor1doT6jRvQoOZncnkMSIpCvF7juZn3OtXqCyAS1d1FuFsAs1gRJ6rcq+uR8eO+75NXzAFfenli/Iufm3n2icenLy+tadKNCYlJXNe1qSiSJFV0IxrbrC7k7jcraVB3oqXFU1Gn8wKIBKp9O+HuRtQbKNycm235z02T4zo0emwYR09PjJ85NjKetFqYudNQBE114rCedcGJVZjU2MyhHNOtf9Vr5ZsXtv3Qok/kDxWgIg6I9N7rfzk7+YWvBZIdGkq7cdporvMbtUBqGx1uLZatJ+xng5VVLzM9FiZpry+IVWFWYjYgMiqS2Ysc6NcHVIkIErU3h9Z+eXGp1FyLw0bTWy4vO0vXF7xO+YYz6LA/Vi1f9hffPT9QKByubLRtdz0wSGIia1lFXKi4jxrFfTPQy4I6RCy1q1fOHb7405tHn3+pEReHHhOrnpuEDSyXG61/XnrRGuMlb78xl774lQt+a+NQqVML0sq9EwCpKvaM/AH2fBFtn2Ce56bsumkcdXPbHJQBPXz66VkqFNOofH2i2wzGQaT7if6RAv4jglS39XHdmmoPecxsPVz2iT2fZACgKrw1xhREgCrtIFditj1f5Yddt/9ZwDYQtG+ySEX+m/98ANxvXToo1Gvz9JHvBfxAyUETP+DknYaDJAd2bMcPcJDr+b8B3nk1lmsJdSoAAAAASUVORK5CYII=" />
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
    width:40px; height:40px; border-radius:13px; flex:none; display:grid; place-items:center; overflow:hidden;
    background:linear-gradient(165deg,#1C4E73,#0C3450);
    box-shadow:0 8px 18px -8px rgba(12,80,130,.7), inset 0 2px 2px rgba(255,255,255,.18), inset 0 -3px 6px rgba(0,0,0,.25);
  }
  .brand .mark img{width:80%; height:80%; object-fit:contain; display:block;}
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
  .tier.t3 .chip.hl{background:linear-gradient(180deg,#FFE07A,#FFCE3A); border-color:transparent; color:#5A4500; box-shadow:0 6px 12px -5px rgba(220,170,20,.5), inset 0 1px 0 rgba(255,255,255,.5);}
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
  footer{background:var(--navy); color:rgba(255,255,255,.66); padding:58px 0 40px; font-size:14.5px; margin-top:20px;}
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
</style>
</head>
<body>

<!-- ══════════ 헤더 ══════════ -->
<header id="top">
  <div class="wrap nav">
    <a href="#top" class="brand" aria-label="레벨업과외 홈">
      <span class="mark"><img src="data:image/png;base64,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" alt="레벨업 과외 로고" /></span>
      레벨업과외
    </a>
    <nav>
      <ul class="nav-links" id="navLinks">
        <li><a href="#subjects">수업 과목</a></li>
        <li><a href="#how">수업 방식</a></li>
        <li><a href="#reviews">수강 후기</a></li>
        <li><a href="#contact">상담 문의</a></li>
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
          <span class="chip">국어</span><span class="chip">영어</span><span class="chip">수학</span>
          <span class="chip">사회</span><span class="chip">과학</span>
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
          <span class="chip">국어</span><span class="chip">영어</span><span class="chip">수학</span>
          <span class="chip">사회</span><span class="chip">과학</span>
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
            <div class="chips"><span class="chip">국어</span><span class="chip">영어</span><span class="chip">수학</span></div>
          </div>
          <div class="grp">
            <div class="grp-label">선택과목</div>
            <div class="chips"><span class="chip hl">미적분</span><span class="chip hl">기하</span><span class="chip hl">확률과 통계</span><span class="chip hl">언어와 매체</span><span class="chip hl">문학·독서</span></div>
          </div>
          <div class="grp">
            <div class="grp-label">탐구과목 (사탐 · 과탐)</div>
            <div class="chips"><span class="chip">생활과 윤리</span><span class="chip">사회·문화</span><span class="chip">한국지리</span><span class="chip">물리학</span><span class="chip">화학</span><span class="chip">생명과학</span><span class="chip">지구과학</span></div>
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
            <a class="qrow" href="#" target="_blank" rel="noopener">
              <span class="qic"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7-.2.7-.7 2.5-.8 2.9 0 0 0 .3.2.4.2 0 .3 0 .4-.1.4-.3 2.6-1.8 3.6-2.5.6.1 1.2.1 1.9.1 5.5 0 10-3.6 10-8S17.5 3 12 3Z"/></svg></span>
              <span><span class="ql">카카오톡</span><span class="qv">카톡으로 상담하기</span></span>
            </a>
            <a class="qrow" href="mailto:hello@level-up-lesson.com">
              <span class="qic"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="m2 7 10 6 10-6"/></svg></span>
              <span><span class="ql">이메일</span><span class="qv">hello@level-up-lesson.com</span></span>
            </a>
          </div>
        </div>

        <div class="form-card">
          <form id="inquiryForm" novalidate>
            <div class="form-row">
              <div class="field"><label for="name">학생 이름 <span class="req">*</span></label><input id="name" name="name" type="text" placeholder="학생 성함" required /></div>
              <div class="field"><label for="phone">학부모 연락처 <span class="req">*</span></label><input id="phone" name="phone" type="tel" placeholder="010-0000-0000" required /></div>
            </div>
            <div class="field">
              <label for="grade">학생 학년</label>
              <select id="grade" name="grade">
                <option value="">선택해주세요</option>
                <optgroup label="초등"><option>초등 1~2학년</option><option>초등 3~4학년</option><option>초등 5~6학년</option></optgroup>
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
            <div class="field full"><label for="address">주소 <span class="req">*</span></label><input id="address" name="address" type="text" placeholder="수업 받을 지역·주소 (예: 서울시 강남구 …)" required /></div>
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
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brand">
        <div class="brand"><span class="mark"><img src="data:image/png;base64,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" alt="레벨업 과외 로고" /></span> 레벨업과외</div>
        <p>초·중·고 전과목 1:1 맞춤 과외. 학생의 현재 레벨에서 시작해, 다음 단계로 함께 올라갑니다.</p>
      </div>
      <div class="foot-cols">
        <div class="foot-col">
          <h4>바로가기</h4>
          <a href="#subjects">수업 과목</a><a href="#how">수업 방식</a><a href="#reviews">수강 후기</a><a href="#contact">상담 문의</a>
        </div>
        <div class="foot-col">
          <h4>상담 연락처</h4>
          <!-- ▼ 실제 정보로 바꿔주세요 -->
          <span>전화 010-3038-8978</span><span>카카오톡 @leveluplesson</span><span>hello@level-up-lesson.com</span>
        </div>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© {{YEAR}} 레벨업과외. All rights reserved.</span>
      <span class="dom">level-up-lesson.com</span>
    </div>
  </div>
</footer>

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
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = form.elements;
    const name = f['name'].value.trim(), phone = f['phone'].value.trim(), address = f['address'].value.trim();
    if (!name || !phone || !address){
      const miss = !name ? f['name'] : (!phone ? f['phone'] : f['address']);
      miss.focus(); alert('학생 이름, 학부모 연락처, 주소를 입력해주세요.'); return;
    }
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
    if (path === "/" || path === "/index.html") {
      // 동적 생성: 요청 시점 기준 값 주입 (예: 연도). 필요한 값을 여기서 더 끼워 넣으면 됩니다.
      const year = new Date().getFullYear();
      const page = HTML.replaceAll("{{YEAR}}", String(year));
      return new Response(page, {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" },
      });
    }
    return new Response("Not Found", { status: 404 });
  },
};
