import Header from "@/components/Header";
import GlobalRiskMap from "@/components/GlobalRiskMap";
import EventFeed from "@/components/EventFeed";
import RiskOilPriceChart from "@/components/RiskOilPriceChart";
import ShippingStatus from "@/components/ShippingStatus";
import CrisisBriefing from "@/components/CrisisBriefing";
import ChatBot from "@/components/ChatBot";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)]">
        <Header />

        <main className="p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Global Risk Map - takes 2 columns */}
          <div className="lg:col-span-2">
            <GlobalRiskMap />
          </div>

          {/* Right column: Crisis Briefing first, then Event Feed */}
          <div className="flex flex-col gap-6">
            <CrisisBriefing />
            <EventFeed />
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <RiskOilPriceChart />
          <ShippingStatus />
        </div>

        <ChatBot />
      </main>
    </div>
    </ProtectedRoute>
  );
}
