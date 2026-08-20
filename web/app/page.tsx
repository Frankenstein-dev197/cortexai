import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Pipelines } from "@/components/Pipelines";
import { Integrations } from "@/components/Integrations";
import { Pricing } from "@/components/Pricing";
import { Faq } from "@/components/Faq";
import { CtaFooter } from "@/components/CtaFooter";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Features />
      <Pipelines />
      <Integrations />
      <Pricing />
      <Faq />
      <CtaFooter />
    </main>
  );
}
