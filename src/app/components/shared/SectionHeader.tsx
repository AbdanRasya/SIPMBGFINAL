import { BLUE } from "@/app/data/constants";

interface SectionHeaderProps {
  badge: string;
  title: string;
  subtitle: string;
  dark?: boolean;
}

/** Reusable centered section header with badge, title, and subtitle */
export function SectionHeader({ badge, title, subtitle, dark }: SectionHeaderProps) {
  return (
    <div className="text-center mb-14">
      <span
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5"
        style={{
          background: dark ? "rgba(37,99,235,0.15)" : "#EFF6FF",
          color: BLUE,
        }}
      >
        {badge}
      </span>
      <h2
        className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight"
        style={{ color: dark ? "#F1F5F9" : "#0F172A" }}
      >
        {title}
      </h2>
      <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
        style={{ color: dark ? "#94A3B8" : "#64748B" }}
      >
        {subtitle}
      </p>
    </div>
  );
}
