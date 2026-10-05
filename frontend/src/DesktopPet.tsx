import { useEffect, useRef, useState } from "react";

const SPRITE = "https://cdn.jsdelivr.net/gh/adryd325/oneko.js@main/oneko.gif";

type Frame = [number, number];

const SPRITE_SETS: Record<string, Frame[]> = {
  idle: [[-3, -3]],
  alert: [[-7, -3]],
  scratch: [[-5, 0], [-6, 0], [-7, 0]],
  tired: [[-3, -2]],
  sleeping: [[-2, 0], [-2, -1]],
  N: [[-1, -2], [-1, -3]],
  NE: [[0, -2], [0, -3]],
  E: [[-3, 0], [-3, -1]],
  SE: [[-5, -1], [-5, -2]],
  S: [[-6, -3], [-7, -2]],
  SW: [[-5, -3], [-6, -1]],
  W: [[-4, -2], [-4, -3]],
  NW: [[-1, 0], [-1, -1]],
};

function DesktopPet() {
  const elRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(false);
  const followSecondsRef = useRef(0);
  const dockedSecondsRef = useRef(0);
  const lastHintTimeRef = useRef(-Infinity);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    let pos = { x: 32, y: 32 };
    let mouse = { x: pos.x, y: pos.y };
    let docked = false; // toggled by double-click
    let frameCount = 0;
    let idleTime = 0;
    let idleAnim: string | null = null;
    let idleFrame = 0;

    function onMove(e: MouseEvent) {
      if (!docked) mouse = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener("mousemove", onMove);

    function onDoubleClick() {
      docked = !docked;
      if (docked) {
        const logo = document.querySelector(".navbar h2");
        if (logo) {
          const rect = logo.getBoundingClientRect();
          mouse = { x: rect.right + 18, y: rect.top + 10 };
        }
      }
    }
    el.addEventListener("dblclick", onDoubleClick);

    function setSprite(name: string, frame: number) {
      const set = SPRITE_SETS[name];
      if (!set) return;
      const sprite = set[frame % set.length];
      if (!sprite) return;
      const [x, y] = sprite;
      el!.style.backgroundPosition = `${x * 32}px ${y * 32}px`;
    }

    function idleSprite() {
      idleAnim ||= Math.random() > 0.5 ? "sleeping" : "idle";
      if (idleAnim === "sleeping") {
        if (idleTime === 1) setSprite("tired", 0);
        else if (idleTime > 8) setSprite("sleeping", Math.floor(idleTime / 4));
        else setSprite("idle", 0);
      } else {
        setSprite("scratch", idleFrame);
      }
      if (idleTime > 10 && Math.random() < 0.005) idleAnim = null;
    }

    const interval = setInterval(() => {
      frameCount++;
      const dx = mouse.x - pos.x - 16;
      const dy = mouse.y - pos.y - 24;
      const dist = Math.hypot(dx, dy);

      if (dist < 12) {
        idleTime++;
        idleFrame = frameCount % 3;
        idleSprite();
      } else {
        idleAnim = null;
        idleTime = 0;

        const angle = Math.atan2(dy, dx);
        const dirs = ["E", "SE", "S", "SW", "W", "NW", "N", "NE"];
        const dir = dirs[Math.round(((angle + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 4)) % 8] ?? "E";

        setSprite(dir, frameCount % 2);

        const step = Math.min(dist, docked ? 20 : 12); // hop up to the logo a bit faster
        pos = {
          x: pos.x + (dx / dist) * step,
          y: pos.y + (dy / dist) * step,
        };
      }

      el!.style.left = `${pos.x}px`;
      el!.style.top = `${pos.y}px`;

      // Show the hint if the cat's been chasing you or sitting on the logo
      // for a while, but not more than once per cooldown window.
      const now = Date.now();
      if (docked) {
        followSecondsRef.current = 0;
        dockedSecondsRef.current += 0.13;
      } else {
        dockedSecondsRef.current = 0;
        followSecondsRef.current += 0.13;
      }

      const cooledDown = now - lastHintTimeRef.current > 20000;
      if (cooledDown && (followSecondsRef.current > 8 || dockedSecondsRef.current > 5)) {
        lastHintTimeRef.current = now;
        setShowHint(true);
        setTimeout(() => setShowHint(false), 4000);
      }
    }, 130); // ~7-8 fps — the choppy oneko run cycle

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("dblclick", onDoubleClick);
    };
  }, []);

  return (
    <>
      <div
        ref={elRef}
        style={{
          position: "fixed",
          width: 32,
          height: 32,
          backgroundImage: `url(${SPRITE})`,
          imageRendering: "pixelated",
          pointerEvents: "auto",
          cursor: "pointer",
          zIndex: 9999,
        }}
        aria-hidden="true"
      />
      {showHint && (
        <div
          style={{
            position: "fixed",
            bottom: 16,
            right: 16,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            background: "var(--surface, #fff)",
            border: "1px solid var(--hairline, #e4e0d4)",
            borderRadius: 10,
            padding: "8px 14px",
            fontSize: 13,
            color: "var(--text-dim, #6b6863)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          🐾 double-click the cat!
          <div
            style={{
              height: 2,
              width: "100%",
              background: "var(--hairline, #e4e0d4)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              key={lastHintTimeRef.current}
              style={{
                height: "100%",
                width: "100%",
                background: "var(--accent, #eab308)",
                transformOrigin: "left",
                animation: "petHintShrink 4s linear forwards",
              }}
            />
          </div>
        </div>
      )}
      <style>{`
        @keyframes petHintShrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </>
  );
}

export default DesktopPet;
