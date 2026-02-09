import { Features } from "@/components/ui/features-5";
import { CTA } from "@/components/ui/call-to-action";
import { Faq5 } from "@/components/ui/faq-5";
import { Footer7 } from "@/components/ui/footer-7";
import { Component as Hero } from "@/components/ui/gradient-bar-hero-section";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";

const Index = () => {
  return (
    <div>
      <Hero />
      <div className="min-h-screen w-full relative">
        {/* Crimson Depth */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(100% 100% at 10% 100%, #000000 60%, #911403 101%)",
          }}
        />
        {/* CONTENT */}
        <div className="relative z-10">
          <div className="max-w-360 mx-auto py-10">
            <HeroVideoDialog
              className="hidden dark:block"
              animationStyle="top-in-bottom-out"
              videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
              thumbnailSrc="https://startup-template-sage.vercel.app/hero-dark.png"
              thumbnailAlt="Hero Video"
            />
          </div>
          <Features />
          <CTA />
          <Faq5 />
          <Footer7 />
        </div>
      </div>
    </div>
  );
};

export default Index;
