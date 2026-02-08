import { Features } from "@/components/blocks/features-5"
import { CTA } from "@/components/ui/call-to-action"
import DatabaseWithRestApi from "@/components/ui/database-with-rest-api"
import { Faq5 } from "@/components/ui/faq-5"
import { Footer7 } from "@/components/ui/footer-7"
import { Component } from "@/components/ui/gradient-bar-hero-section"

const Index = () => {
  return (
    <div>
      <Component />
      <DatabaseWithRestApi />
      <Faq5 />
      <Features />
      <CTA />
      <Footer7 />
    </div>
  )
}

export default Index