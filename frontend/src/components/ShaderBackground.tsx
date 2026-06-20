import { useEffect, useState } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import { cn } from "@/lib/utils";

// A real WebGL mesh-gradient (Paper Shaders) — a slow, living field of deep
// emerald light. This is the hero's signature: not a static CSS gradient but a
// flowing shader. Honors prefers-reduced-motion by freezing the animation.
const EMERALD = ["#04130D", "#0C7A57", "#063A29", "#1FA971", "#0A1C16"];

// A calmer sibling of the hero palette — the same emerald family, but muted and
// desaturated: deep pine, forest, and a wash of sage. Run at low speed/distortion
// as a quiet ambient field behind the working pages — green, never blue.
export const CHILL = ["#0B201A", "#0C5B40", "#0C7A57", "#2FA277", "#0A1C16"];

export function ShaderBackground({
  className,
  colors = EMERALD,
  speed = 0.3,
  distortion = 0.85,
  swirl = 0.55
}: {
  className?: string;
  colors?: string[];
  speed?: number;
  distortion?: number;
  swirl?: number;
}) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div
      className={cn("absolute inset-0 -z-10 overflow-hidden bg-[#04130D]", className)}
      aria-hidden
    >
      <MeshGradient
        colors={colors}
        distortion={distortion}
        swirl={swirl}
        grainMixer={0.2}
        grainOverlay={0.1}
        speed={reduced ? 0 : speed}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
