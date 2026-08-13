import PublicLayout from '@/components/layout/PublicLayout'
import SEOHead from '@/components/seo/SEOHead'
import { ChefHat, Heart, Leaf } from 'lucide-react'

export default function About() {
  return (
    <PublicLayout>
      <SEOHead
        title="About Recipet"
        description="Recipet is a premium recipe discovery platform for home cooks and food lovers. Learn about our mission to make cooking more approachable and enjoyable."
        canonical="/about"
      />

      {/* Hero */}
      <section className="bg-white border-b border-[#E9E1D8] py-16 sm:py-24">
        <div className="section-container max-w-3xl text-center">
          <p className="text-[#E4573D] text-xs font-semibold uppercase tracking-widest mb-4">Our story</p>
          <h1
            className="font-serif text-[#24211F] mb-5"
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
            }}
          >
            Cooking made beautiful.
          </h1>
          <p className="text-[1.0625rem] text-[#6F6862] leading-relaxed">
            Recipet is a premium recipe discovery platform for home cooks and food lovers.
            We believe good food starts with clear, trustworthy recipes — no fuss, no gimmicks.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-24 section-container">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-4xl mx-auto">
          {[
            {
              icon: ChefHat,
              title: 'Real Recipes',
              desc: 'Every recipe is written for real home cooks — with clear instructions, accurate timings, and ingredients you can actually find.',
            },
            {
              icon: Heart,
              title: 'Made with Care',
              desc: 'We take food seriously. Every recipe on Recipet is designed to deliver results you\'ll be proud to share.',
            },
            {
              icon: Leaf,
              title: 'For Every Kitchen',
              desc: 'Whether you\'re cooking for one or for a crowd, quick weeknights or weekend projects, Recipet has something for you.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="w-12 h-12 bg-[#FEF0EC] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon size={22} className="text-[#E4573D]" />
              </div>
              <h2
                className="font-serif text-[#24211F] mb-2"
                style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '1.25rem' }}
              >
                {title}
              </h2>
              <p className="text-sm text-[#6F6862] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider section-container max-w-4xl" />

      {/* Contact */}
      <section id="contact" className="py-16 sm:py-24 section-container max-w-2xl">
        <p className="text-[#E4573D] text-xs font-semibold uppercase tracking-widest mb-4">Get in touch</p>
        <h2
          className="font-serif text-[#24211F] mb-4"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
        >
          We'd love to hear from you.
        </h2>
        <p className="text-[#6F6862] text-[0.9375rem] leading-relaxed mb-6">
          Have a question, a recipe suggestion, or just want to say hello?
          Drop us an email and we'll get back to you as soon as we can.
        </p>
        <a
          href="mailto:hello@recipet.com"
          className="btn-primary inline-flex"
          id="contact-email-link"
        >
          hello@recipet.com
        </a>
      </section>
    </PublicLayout>
  )
}
