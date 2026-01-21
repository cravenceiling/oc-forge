import { Header } from "@/components/common/header";
import HeroSection from "./components/hero-section";

export default async function Page() {
  return (
    <div className="bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
      </main>
    </div>
  );
}
