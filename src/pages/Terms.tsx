import PublicLayout from '@/components/layout/PublicLayout'
import SEOHead from '@/components/seo/SEOHead'

export default function Terms() {
  return (
    <PublicLayout>
      <SEOHead
        title="Terms & Conditions"
        description="Recipet terms and conditions — the rules governing your use of our website."
        canonical="/terms"
      />
      <div className="section-container py-16 max-w-3xl">
        <h1
          className="font-serif text-[#24211F] mb-4"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(1.75rem, 4vw, 2.25rem)' }}
        >
          Terms & Conditions
        </h1>
        <p className="text-sm text-[#6F6862] mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="space-y-6 text-[0.9375rem] text-[#24211F] leading-relaxed">
          <section>
            <h2 className="font-serif text-[1.25rem] text-[#24211F] mb-2" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>1. Acceptance of Terms</h2>
            <p className="text-[#6F6862]">By using the Recipet website, you agree to these terms and conditions. If you do not agree, please do not use our site.</p>
          </section>
          <section>
            <h2 className="font-serif text-[1.25rem] text-[#24211F] mb-2" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>2. Use of Content</h2>
            <p className="text-[#6F6862]">All recipes, text, and images on Recipet are for personal, non-commercial use only. You may not reproduce or republish our content without written permission.</p>
          </section>
          <section>
            <h2 className="font-serif text-[1.25rem] text-[#24211F] mb-2" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>3. Disclaimer</h2>
            <p className="text-[#6F6862]">Recipes are provided for informational purposes only. Always exercise caution with food preparation and allergen information. Recipet is not responsible for any adverse outcomes from following our recipes.</p>
          </section>
          <section>
            <h2 className="font-serif text-[1.25rem] text-[#24211F] mb-2" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>4. Changes to Terms</h2>
            <p className="text-[#6F6862]">We may update these terms at any time. Continued use of the site after changes constitutes acceptance of the revised terms.</p>
          </section>
          <section>
            <h2 className="font-serif text-[1.25rem] text-[#24211F] mb-2" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>5. Contact</h2>
            <p className="text-[#6F6862]">Questions? Email us at <a href="mailto:hello@recipet.com" className="text-[#E4573D] hover:underline">hello@recipet.com</a>.</p>
          </section>
        </div>
      </div>
    </PublicLayout>
  )
}
