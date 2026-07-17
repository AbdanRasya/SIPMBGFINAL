import React, { useState, useEffect } from "react";
import { ThemeProps } from "@/app/data/constants";

// Detailed SVG Icons (100x100 ViewBox)
const OmprengIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="10" y="10" width="80" height="80" rx="12" />
    <line x1="50" y1="10" x2="50" y2="90" strokeWidth="3" />
    <line x1="50" y1="50" x2="90" y2="50" strokeWidth="2.5" />
    <circle cx="22" cy="22" r="2.5" fill="currentColor" opacity="0.8" />
    <circle cx="34" cy="28" r="2.5" fill="currentColor" opacity="0.8" />
    <circle cx="20" cy="38" r="2.5" fill="currentColor" opacity="0.8" />
    <circle cx="30" cy="46" r="2.5" fill="currentColor" opacity="0.8" />
    <circle cx="24" cy="58" r="2.5" fill="currentColor" opacity="0.8" />
    <circle cx="38" cy="52" r="2.5" fill="currentColor" opacity="0.8" />
    <circle cx="30" cy="68" r="2.5" fill="currentColor" opacity="0.8" />
    <circle cx="20" cy="74" r="2.5" fill="currentColor" opacity="0.8" />
    <circle cx="38" cy="76" r="2.5" fill="currentColor" opacity="0.8" />
    <circle cx="70" cy="30" r="13" stroke="currentColor" strokeWidth="2" />
    <circle cx="70" cy="30" r="6" fill="currentColor" />
    <path d="M 58,68 Q 63,60 68,68 Q 73,76 78,68" />
    <circle cx="64" cy="78" r="4.5" fill="currentColor" />
    <circle cx="76" cy="76" r="4.5" fill="currentColor" />
  </svg>
);

const MakananIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M50,85 C25,85 15,65 15,45 C15,25 35,20 50,28 C65,20 85,25 85,45 C85,65 75,85 50,85 Z" />
    <path d="M50,26 C48,15 54,10 54,10" strokeWidth="3" />
    <path d="M52,18 C61,18 66,11 66,11 C66,11 57,11 52,18 Z" fill="currentColor" opacity="0.7" />
    <path d="M28,40 A 15 15 0 0 1 40,28" strokeWidth="1.5" opacity="0.75" />
  </svg>
);

const SoupIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 45 C15 75, 85 75, 85 45" strokeWidth="3" />
    <line x1="10" y1="45" x2="90" y2="45" strokeWidth="3.5" />
    <path d="M38 72 L62 72 L58 82 L42 82 Z" />
    <path d="M35 15 Q30 25 35 35" strokeWidth="2" />
    <path d="M50 10 Q45 22 50 35" strokeWidth="2" />
    <path d="M65 15 Q60 25 65 35" strokeWidth="2" />
    <line x1="25" y1="36" x2="80" y2="20" strokeWidth="2.5" />
    <line x1="25" y1="41" x2="85" y2="22" strokeWidth="2.5" />
  </svg>
);

const MinumIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M 25,25 L 32,80 C 33,85 37,88 42,88 L 58,88 C 63,88 67,85 68,80 L 75,25 Z" strokeWidth="2.5" />
    <rect x="20" y="20" width="60" height="6" rx="3" strokeWidth="3" />
    <line x1="50" y1="20" x2="60" y2="5" strokeWidth="4" />
    <line x1="50" y1="20" x2="45" y2="55" strokeWidth="3" />
    <path d="M 28,45 Q 50,42 72,45" strokeWidth="2" />
    <circle cx="38" cy="78" r="3.5" fill="currentColor" />
    <circle cx="46" cy="80" r="4" fill="currentColor" />
    <circle cx="54" cy="76" r="3.5" fill="currentColor" />
    <circle cx="62" cy="79" r="3.5" fill="currentColor" />
    <circle cx="42" cy="70" r="3.5" fill="currentColor" />
    <circle cx="50" cy="68" r="4" fill="currentColor" />
    <circle cx="58" cy="71" r="3.5" fill="currentColor" />
    <circle cx="48" cy="60" r="3" fill="currentColor" />
  </svg>
);

interface BackgroundIcon {
  type: "ompreng" | "makanan" | "soup" | "minum";
  color: "blue" | "green";
  left: number; // percentage
  size: number; // px
  delay: number; // seconds (negative delay to stagger starting positions)
  duration: number; // seconds
  reverse: boolean;
  depth: number; // parallax strength (px offset)
}

const BACKGROUND_ICONS: BackgroundIcon[] = [
  { type: "ompreng", color: "blue", left: 5, size: 85, delay: -35, duration: 32, reverse: false, depth: 25 },
  { type: "makanan", color: "green", left: 12, size: 70, delay: -8, duration: 40, reverse: true, depth: 15 },
  { type: "minum", color: "blue", left: 20, size: 65, delay: -24, duration: 28, reverse: false, depth: 30 },
  { type: "soup", color: "green", left: 28, size: 95, delay: -15, duration: 45, reverse: true, depth: 20 },
  
  { type: "makanan", color: "blue", left: 35, size: 75, delay: -2, duration: 36, reverse: true, depth: 35 },
  { type: "ompreng", color: "green", left: 42, size: 90, delay: -18, duration: 42, reverse: false, depth: 10 },
  { type: "minum", color: "blue", left: 50, size: 60, delay: -30, duration: 30, reverse: false, depth: 20 },
  { type: "soup", color: "green", left: 58, size: 80, delay: -11, duration: 38, reverse: true, depth: 25 },

  { type: "ompreng", color: "green", left: 65, size: 90, delay: -27, duration: 34, reverse: true, depth: 20 },
  { type: "makanan", color: "blue", left: 72, size: 75, delay: -5, duration: 46, reverse: false, depth: 30 },
  { type: "minum", color: "green", left: 80, size: 65, delay: -19, duration: 26, reverse: true, depth: 15 },
  { type: "soup", color: "blue", left: 88, size: 100, delay: -33, duration: 48, reverse: false, depth: 25 },

  { type: "ompreng", color: "blue", left: 95, size: 80, delay: -14, duration: 35, reverse: false, depth: 10 },
  { type: "makanan", color: "green", left: 8, size: 70, delay: -40, duration: 39, reverse: true, depth: 35 },
  { type: "minum", color: "blue", left: 16, size: 60, delay: -21, duration: 31, reverse: false, depth: 20 },
  { type: "soup", color: "green", left: 24, size: 85, delay: -3, duration: 43, reverse: true, depth: 30 },

  { type: "ompreng", color: "blue", left: 32, size: 95, delay: -29, duration: 33, reverse: false, depth: 15 },
  { type: "makanan", color: "green", left: 40, size: 75, delay: -12, duration: 41, reverse: true, depth: 25 },
  { type: "minum", color: "blue", left: 48, size: 65, delay: -36, duration: 29, reverse: false, depth: 30 },
  { type: "soup", color: "green", left: 56, size: 90, delay: -7, duration: 47, reverse: true, depth: 10 },

  { type: "ompreng", color: "green", left: 64, size: 80, delay: -23, duration: 37, reverse: true, depth: 20 },
  { type: "makanan", color: "blue", left: 72, size: 70, delay: -1, duration: 44, reverse: false, depth: 35 },
  { type: "minum", color: "green", left: 80, size: 60, delay: -17, duration: 27, reverse: true, depth: 25 },
  { type: "soup", color: "blue", left: 88, size: 85, delay: -31, duration: 39, reverse: false, depth: 15 },

  { type: "ompreng", color: "green", left: 93, size: 85, delay: -10, duration: 31, reverse: true, depth: 30 },
  { type: "makanan", color: "blue", left: 3, size: 75, delay: -26, duration: 43, reverse: false, depth: 20 },
  { type: "minum", color: "green", left: 45, size: 65, delay: -5, duration: 28, reverse: true, depth: 10 },
  { type: "soup", color: "blue", left: 62, size: 90, delay: -38, duration: 49, reverse: false, depth: 25 },

  { type: "ompreng", color: "blue", left: 75, size: 80, delay: -20, duration: 36, reverse: false, depth: 15 },
  { type: "makanan", color: "green", left: 84, size: 75, delay: -13, duration: 42, depth: 35, reverse: true },
  { type: "minum", color: "blue", left: 52, size: 60, delay: -2, duration: 30, reverse: false, depth: 20 },
  { type: "soup", color: "green", left: 91, size: 90, delay: -30, duration: 45, reverse: true, depth: 30 },
];

interface InteractiveIconProps {
  icon: BackgroundIcon;
  theme: ThemeProps;
  mousePos: { x: number; y: number };
}

function InteractiveIcon({ icon, theme, mousePos }: InteractiveIconProps) {
  const [hovered, setHovered] = useState(false);
  const isDark = theme.dark;

  const IconComponent = 
    icon.type === "ompreng" ? OmprengIcon :
    icon.type === "makanan" ? MakananIcon :
    icon.type === "soup" ? SoupIcon : MinumIcon;

  // Parallax offsets (based on normalized mouse coordinates and depth)
  const offsetX = mousePos.x * icon.depth;
  const offsetY = mousePos.y * icon.depth;

  // Watermark styles
  const defaultColor = isDark
    ? (icon.color === "blue" ? "rgba(96, 165, 250, 0.05)" : "rgba(52, 211, 153, 0.05)")
    : (icon.color === "blue" ? "rgba(37, 99, 235, 0.08)" : "rgba(22, 163, 74, 0.08)");
    
  const hoverColor = icon.color === "blue"
    ? (isDark ? "#60A5FA" : "#2563EB")
    : (isDark ? "#34D399" : "#16A34A");

  return (
    /* Layer 1: Mouse Parallax Wrapper */
    <div
      className="absolute transition-transform duration-500 ease-out"
      style={{
        top: `0px`,
        left: `${icon.left}%`,
        width: `${icon.size}px`,
        height: `${icon.size}px`,
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        zIndex: hovered ? 50 : 1,
      }}
    >
      {/* Layer 2: Animation Wrapper (Continuous upward movement from 105vh to -20vh) */}
      <div
        className="w-full h-full"
        style={{
          animation: `float-upward ${icon.duration}s linear infinite`,
          animationDelay: `${icon.delay}s`,
        }}
      >
        {/* Layer 3: Interactive Hover Wrapper */}
        <div
          className="w-full h-full cursor-pointer pointer-events-auto transition-all duration-300 ease-in-out"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            color: hovered ? hoverColor : defaultColor,
            transform: hovered ? "scale(1.25) rotate(15deg)" : "scale(1)",
            filter: hovered 
              ? `drop-shadow(0 4px 20px ${icon.color === 'blue' ? 'rgba(59,130,246,0.6)' : 'rgba(16,185,129,0.6)'})`
              : "none",
          }}
        >
          <IconComponent className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}

export function FoodPatternBackground({ theme }: { theme: ThemeProps }) {
  const isDark = theme.dark;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // CSS for continuous upward scrolling and wrapping
  const styles = `
    @keyframes float-upward {
      0% {
        transform: translateY(105vh) rotate(0deg);
      }
      100% {
        transform: translateY(-20vh) rotate(360deg);
      }
    }
  `;

  const getGradient = () => {
    if (isDark) {
      return "linear-gradient(135deg, #0b1329 0%, #0d2137 40%, #022c22 80%, #01241b 100%)";
    } else {
      return "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 35%, #f0fdf4 75%, #dcfce7 100%)";
    }
  };

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none transition-all duration-300"
      style={{ 
        background: getGradient(),
        zIndex: 0
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      
      {BACKGROUND_ICONS.map((icon, idx) => (
        <InteractiveIcon 
          key={idx} 
          icon={icon} 
          theme={theme} 
          mousePos={mousePos} 
        />
      ))}
    </div>
  );
}
