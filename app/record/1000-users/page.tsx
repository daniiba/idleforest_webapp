const celebrationHtml = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IdleForest 1000 Users</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      html,
      body {
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #edf0e5;
        color: #0b101f;
        font-family: Inter, "Helvetica Neue", Arial, sans-serif;
      }

      body {
        position: relative;
      }

      .stage {
        position: relative;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        background:
          radial-gradient(circle at 50% 12%, rgba(224, 241, 70, 0.36) 0%, rgba(224, 241, 70, 0.08) 26%, rgba(224, 241, 70, 0) 46%),
          linear-gradient(180deg, #f7f9ef 0%, #edf0e5 54%, #e5e8dc 100%);
      }

      .mesh {
        position: absolute;
        inset: -8%;
        opacity: 0.34;
        background-image:
          linear-gradient(rgba(11, 16, 31, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(11, 16, 31, 0.05) 1px, transparent 1px);
        background-size: 120px 120px;
        mask-image: radial-gradient(circle at center, black 34%, transparent 78%);
      }

      .orb {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 64vw;
        height: 64vw;
        max-width: 980px;
        max-height: 980px;
        border-radius: 999px;
        transform: translate(-50%, -50%);
        background: radial-gradient(circle, rgba(224, 241, 70, 0.62) 0%, rgba(224, 241, 70, 0.18) 34%, rgba(224, 241, 70, 0) 68%);
        filter: blur(22px);
      }

      .frame {
        position: absolute;
        inset: 5.2vh 4.8vw;
        border-radius: 38px;
        border: 4px solid #0b101f;
        background:
          linear-gradient(145deg, rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0.72)),
          #d9d9d9;
        box-shadow: 18px 18px 0 #0b101f;
        overflow: hidden;
      }

      .frame::before {
        content: "";
        position: absolute;
        inset: 22px;
        border-radius: 28px;
        border: 1px solid rgba(11, 16, 31, 0.09);
      }

      .ring,
      .ring::before,
      .ring::after {
        position: absolute;
        border-radius: 999px;
        border: 1px solid rgba(11, 16, 31, 0.12);
      }

      .ring {
        width: min(54vw, 760px);
        height: min(54vw, 760px);
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      .ring::before,
      .ring::after {
        content: "";
      }

      .ring::before {
        inset: 34px;
        border-style: dashed;
        border-color: rgba(11, 16, 31, 0.08);
      }

      .ring::after {
        inset: 82px;
        border-color: rgba(11, 16, 31, 0.07);
      }

      .content {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        text-align: center;
        padding: 0 6vw;
      }

      .count-wrap {
        position: relative;
        width: min(100%, 1100px);
      }

      .count {
        display: inline-flex;
        align-items: flex-end;
        gap: 0.04em;
        font-size: clamp(92px, 16vw, 224px);
        line-height: 0.9;
        font-weight: 900;
        letter-spacing: -0.09em;
      }

      .digit {
        display: inline-block;
      }

      .comma {
        color: #e0f146;
        transform: translateY(-0.12em);
      }

      .title {
        margin-top: 16px;
        font-size: clamp(28px, 3vw, 46px);
        line-height: 1.02;
        letter-spacing: -0.04em;
        font-weight: 850;
        max-width: 900px;
        margin-left: auto;
        margin-right: auto;
      }

      .body {
        margin: 18px auto 0;
        max-width: 860px;
        font-size: clamp(16px, 1.55vw, 28px);
        line-height: 1.45;
        color: rgba(11, 16, 31, 0.66);
      }

      .pills {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 28px;
      }

      .pill {
        padding: 14px 18px;
        border-radius: 999px;
        border: 2px solid rgba(11, 16, 31, 0.08);
        background: rgba(255, 255, 255, 0.8);
        font-size: clamp(11px, 1vw, 17px);
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: rgba(11, 16, 31, 0.58);
      }

      .particle {
        position: absolute;
        opacity: 0;
        transform-origin: center;
      }

      .leaf-svg {
        width: clamp(38px, 4vw, 72px);
        height: auto;
        overflow: visible;
        filter: drop-shadow(0 10px 16px rgba(11, 16, 31, 0.08));
      }

      .leaf-body {
        fill: #92c76f;
        stroke: rgba(43, 75, 54, 0.85);
        stroke-width: 2.4;
        stroke-linejoin: round;
      }

      .leaf-body.alt {
        fill: #a7d45b;
      }

      .leaf-vein {
        stroke: rgba(43, 75, 54, 0.52);
        stroke-width: 2;
        stroke-linecap: round;
        fill: none;
      }

      .p1 { left: 14%; top: 19%; transform: rotate(-24deg) scale(0.92); --float-y: -18px; --float-x: 7px; --float-r: 6deg; --float-d: 2.1s; }
      .p2 { left: 82%; top: 21%; transform: rotate(26deg) scale(1.02); --float-y: -12px; --float-x: -5px; --float-r: -7deg; --float-d: 1.8s; }
      .p3 { left: 76%; top: 66%; transform: rotate(18deg) scale(0.96); --float-y: -20px; --float-x: 10px; --float-r: 9deg; --float-d: 2.25s; }
      .p4 { left: 18%; top: 72%; transform: rotate(-34deg) scale(1.05); --float-y: -14px; --float-x: -8px; --float-r: -6deg; --float-d: 1.95s; }
      .p5 { left: 29%; top: 16%; transform: rotate(-8deg) scale(0.72); --float-y: -10px; --float-x: 5px; --float-r: 4deg; --float-d: 1.7s; }
      .p6 { left: 70%; top: 16%; transform: rotate(12deg) scale(0.76); --float-y: -16px; --float-x: -6px; --float-r: -5deg; --float-d: 2.05s; }
      .p7 { left: 12%; top: 49%; transform: rotate(-46deg) scale(0.82); --float-y: -22px; --float-x: 8px; --float-r: 10deg; --float-d: 2.3s; }
      .p8 { left: 84%; top: 52%; transform: rotate(42deg) scale(0.84); --float-y: -15px; --float-x: -9px; --float-r: -8deg; --float-d: 1.9s; }
      .p9 { left: 26%; top: 80%; transform: rotate(-10deg) scale(0.72); --float-y: -11px; --float-x: 6px; --float-r: 5deg; --float-d: 1.75s; }
      .p10 { left: 73%; top: 79%; transform: rotate(14deg) scale(0.78); --float-y: -19px; --float-x: -7px; --float-r: -9deg; --float-d: 2.15s; }
    </style>
  </head>
  <body>
    <div
      id="root"
      class="stage"
      data-composition-id="celebrate-1000"
      data-start="0"
      data-duration="10"
      data-width="1600"
      data-height="900"
    >
      <div id="mesh" class="mesh"></div>
      <div id="orb" class="orb"></div>
      <div id="frame" class="frame"></div>
      <div id="ring" class="ring"></div>

      <div class="content">
        <div class="count-wrap">
          <div id="count" class="count">
            <span class="digit">1</span>
            <span class="digit comma">,</span>
            <span class="digit">0</span>
            <span class="digit">0</span>
            <span class="digit">0</span>
          </div>
          <div id="title" class="title">users turning idle internet into real trees</div>
          <div id="body" class="body">
            A thousand people chose a calmer way to make an impact. Small by internet standards, meaningful by forest standards.
          </div>
          <div class="pills">
            <div class="pill stat-pill">Passive impact</div>
            <div class="pill stat-pill">Real reforestation</div>
            <div class="pill stat-pill">Idle bandwidth</div>
          </div>
        </div>
      </div>

      <svg class="particle leaf-svg p1 floaty" viewBox="0 0 72 96" aria-hidden="true">
        <path class="leaf-body" d="M57 9C33 14 15 34 14 58c-1 16 8 25 21 25 24 0 40-26 27-73-1-2-2-2-5-1Z" />
        <path class="leaf-vein" d="M24 76C34 58 43 41 54 17" />
        <path class="leaf-vein" d="M31 60c8-4 14-9 19-17" />
      </svg>
      <svg class="particle leaf-svg p2 floaty" viewBox="0 0 72 96" aria-hidden="true">
        <path class="leaf-body alt" d="M57 9C33 14 15 34 14 58c-1 16 8 25 21 25 24 0 40-26 27-73-1-2-2-2-5-1Z" />
        <path class="leaf-vein" d="M24 76C34 58 43 41 54 17" />
        <path class="leaf-vein" d="M33 55c7-4 14-11 17-18" />
      </svg>
      <svg class="particle leaf-svg p3 floaty" viewBox="0 0 72 96" aria-hidden="true">
        <path class="leaf-body" d="M57 9C33 14 15 34 14 58c-1 16 8 25 21 25 24 0 40-26 27-73-1-2-2-2-5-1Z" />
        <path class="leaf-vein" d="M24 76C34 58 43 41 54 17" />
        <path class="leaf-vein" d="M30 63c9-5 16-12 21-22" />
      </svg>
      <svg class="particle leaf-svg p4 floaty" viewBox="0 0 72 96" aria-hidden="true">
        <path class="leaf-body alt" d="M57 9C33 14 15 34 14 58c-1 16 8 25 21 25 24 0 40-26 27-73-1-2-2-2-5-1Z" />
        <path class="leaf-vein" d="M24 76C34 58 43 41 54 17" />
        <path class="leaf-vein" d="M32 58c7-3 14-9 19-17" />
      </svg>
      <svg class="particle leaf-svg p5 floaty" viewBox="0 0 72 96" aria-hidden="true">
        <path class="leaf-body" d="M57 9C33 14 15 34 14 58c-1 16 8 25 21 25 24 0 40-26 27-73-1-2-2-2-5-1Z" />
        <path class="leaf-vein" d="M24 76C34 58 43 41 54 17" />
      </svg>
      <svg class="particle leaf-svg p6 floaty" viewBox="0 0 72 96" aria-hidden="true">
        <path class="leaf-body alt" d="M57 9C33 14 15 34 14 58c-1 16 8 25 21 25 24 0 40-26 27-73-1-2-2-2-5-1Z" />
        <path class="leaf-vein" d="M24 76C34 58 43 41 54 17" />
      </svg>
      <svg class="particle leaf-svg p7 floaty" viewBox="0 0 72 96" aria-hidden="true">
        <path class="leaf-body" d="M57 9C33 14 15 34 14 58c-1 16 8 25 21 25 24 0 40-26 27-73-1-2-2-2-5-1Z" />
        <path class="leaf-vein" d="M24 76C34 58 43 41 54 17" />
      </svg>
      <svg class="particle leaf-svg p8 floaty" viewBox="0 0 72 96" aria-hidden="true">
        <path class="leaf-body alt" d="M57 9C33 14 15 34 14 58c-1 16 8 25 21 25 24 0 40-26 27-73-1-2-2-2-5-1Z" />
        <path class="leaf-vein" d="M24 76C34 58 43 41 54 17" />
      </svg>
      <svg class="particle leaf-svg p9 floaty" viewBox="0 0 72 96" aria-hidden="true">
        <path class="leaf-body" d="M57 9C33 14 15 34 14 58c-1 16 8 25 21 25 24 0 40-26 27-73-1-2-2-2-5-1Z" />
        <path class="leaf-vein" d="M24 76C34 58 43 41 54 17" />
      </svg>
      <svg class="particle leaf-svg p10 floaty" viewBox="0 0 72 96" aria-hidden="true">
        <path class="leaf-body alt" d="M57 9C33 14 15 34 14 58c-1 16 8 25 21 25 24 0 40-26 27-73-1-2-2-2-5-1Z" />
        <path class="leaf-vein" d="M24 76C34 58 43 41 54 17" />
      </svg>
    </div>

    <script>
      const boot = () => {
        if (!window.gsap) {
          window.setTimeout(boot, 30);
          return;
        }

        const tl = window.gsap.timeline({ repeat: -1, repeatDelay: 0.35 });

        tl.set(
          [".digit", "#title", "#body", ".stat-pill", ".floaty", "#ring"],
          { autoAlpha: 0 }
        );

        tl.fromTo("#frame", {
          autoAlpha: 0,
          scale: 0.96,
          y: 28
        }, {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.95,
          ease: "power3.out"
        }, 0);

        tl.fromTo("#orb", {
          autoAlpha: 0,
          scale: 0.75
        }, {
          autoAlpha: 1,
          scale: 1,
          duration: 1.1,
          ease: "power2.out"
        }, 0);

        tl.fromTo("#mesh", {
          autoAlpha: 0
        }, {
          autoAlpha: 1,
          duration: 0.9,
          ease: "power1.out"
        }, 0.08);

        tl.to("#ring", {
          autoAlpha: 0.5,
          scale: 1.02,
          duration: 1.1,
          ease: "sine.out"
        }, 0.16);

        tl.fromTo(".digit", {
          autoAlpha: 0,
          y: 82,
          rotateX: -80,
          transformOrigin: "50% 100%"
        }, {
          autoAlpha: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.1,
          duration: 0.82,
          ease: "expo.out"
        }, 0.56);

        tl.fromTo("#title", {
          autoAlpha: 0,
          y: 22
        }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out"
        }, 1.01);

        tl.fromTo("#body", {
          autoAlpha: 0,
          y: 16
        }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          ease: "power2.out"
        }, 1.12);

        tl.fromTo(".stat-pill", {
          autoAlpha: 0,
          y: 18
        }, {
          autoAlpha: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.5,
          ease: "power2.out"
        }, 1.26);

        tl.fromTo(".floaty", {
          autoAlpha: 0,
          scale: 0,
          rotate: -18
        }, {
          autoAlpha: 1,
          scale: 1,
          rotate: 0,
          stagger: 0.05,
          duration: 0.44,
          ease: "back.out(2)"
        }, 0.84);

        tl.to(".floaty", {
          y: (_, target) => getComputedStyle(target).getPropertyValue("--float-y").trim() || "-16px",
          x: (_, target) => getComputedStyle(target).getPropertyValue("--float-x").trim() || "7px",
          rotate: (_, target) => {
            const value = getComputedStyle(target).getPropertyValue("--float-r").trim();
            return value ? "+=" + value : "+=8deg";
          },
          duration: (_, target) => {
            const value = getComputedStyle(target).getPropertyValue("--float-d").trim();
            return value ? parseFloat(value) : 2;
          },
          yoyo: true,
          repeat: 1,
          ease: "sine.inOut"
        }, 1.46);

        tl.to("#orb", {
          scale: 1.08,
          duration: 3,
          ease: "sine.inOut"
        }, 1.2);

        tl.to("#ring", {
          scale: 1.06,
          autoAlpha: 0.24,
          duration: 2.8,
          ease: "sine.inOut"
        }, 1.2);

        tl.to(["#frame", ".content", ".floaty", "#ring", "#mesh"], {
          autoAlpha: 0,
          y: -8,
          duration: 0.42,
          ease: "power1.in"
        }, 8.95);
      };

      boot();
    </script>
  </body>
</html>`;

export default function ThousandUsersRecordPage() {
  return (
    <>
      <style>{`
        footer { display: none !important; }
        body { overflow: hidden; }
      `}</style>
      <main className="fixed inset-0 z-[999] bg-[#edf0e5]">
        <iframe
          title="IdleForest 1000 users celebration"
          srcDoc={celebrationHtml}
          className="h-full w-full border-0"
          allow="autoplay"
        />
      </main>
    </>
  );
}
