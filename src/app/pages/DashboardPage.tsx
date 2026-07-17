import { useEffect } from "react";
import { useNavigate } from "react-router";
import { ThemeProps, BLUE } from "@/app/data/constants";
import { ArrowRight } from "lucide-react";

// Sections
import { HeroSection } from "@/app/components/sections/HeroSection";
import { StatsSection } from "@/app/components/sections/StatsSection";
import { AIAnalyzerSection } from "@/app/components/sections/AIAnalyzerSection";
import { FoodDetectionSection } from "@/app/components/sections/FoodDetectionSection";
import { MapSection } from "@/app/components/sections/MapSection";
import { BudgetSection } from "@/app/components/sections/BudgetSection";
import { MonitoringSection } from "@/app/components/sections/MonitoringSection";
import { FeedbackSection } from "@/app/components/sections/FeedbackSection";
import { AnalyticsSection } from "@/app/components/sections/AnalyticsSection";
import { NotificationSection } from "@/app/components/sections/NotificationSection";
import { BenefitsSection } from "@/app/components/sections/BenefitsSection";

interface SectionLinkBannerProps {
  label: string;
  path: string;
  theme: ThemeProps;
}

function SectionLinkBanner({ label, path, theme }: SectionLinkBannerProps) {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center py-4 -mt-6 relative z-10">
      <button
        onClick={() => navigate(path)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95"
        style={{
          background: `linear-gradient(135deg, ${BLUE}, #1D4ED8)`,
          color: "#fff",
        }}
      >
        {label} <ArrowRight size={15} />
      </button>
    </div>
  );
}

export function DashboardPage({ theme }: { theme: ThemeProps }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main id="main-content" className="relative animate-in fade-in duration-500 min-h-screen" style={{ background: "transparent" }}>
      <div className="relative z-10">
        <HeroSection theme={theme} />
        <StatsSection theme={theme} />
        <AIAnalyzerSection theme={theme} />
        <SectionLinkBanner label="Buka Halaman AI Nutrition" path="/ai" theme={theme} />
        <FoodDetectionSection theme={theme} />
        <MapSection theme={theme} />
        <BudgetSection theme={theme} />
        <SectionLinkBanner label="Lihat Transparansi Anggaran Lengkap" path="/budget" theme={theme} />
        <MonitoringSection theme={theme} />
        <FeedbackSection theme={theme} />
        <AnalyticsSection theme={theme} />
        <SectionLinkBanner label="Lihat Dashboard Kinerja Lengkap" path="/laporan" theme={theme} />
        <NotificationSection theme={theme} />
        <BenefitsSection theme={theme} />
      </div>
    </main>
  );
}

