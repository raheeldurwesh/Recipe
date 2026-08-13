import PublicLayout from '@/components/layout/PublicLayout'
import SEOHead from '@/components/seo/SEOHead'

export default function PrivacyPolicy() {
  return (
    <PublicLayout>
      <SEOHead
        title="Privacy Policy"
        description="Recipet privacy policy — how we collect, use, and protect your information."
        canonical="/privacy"
      />
      <div className="section-container py-16 max-w-3xl">
        <h1
          className="font-serif text-[#24211F] mb-4"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(1.75rem, 4vw, 2.25rem)' }}
        >
          Privacy Policy
        </h1>
        <p className="text-sm text-[#6F6862] mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-slate max-w-none space-y-6 text-[0.9375rem] text-[#24211F] leading-relaxed">
          <section>
            <h2 className="font-serif text-[1.25rem] text-[#24211F] mb-2" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>1. Information We Collect</h2>
            <p className="text-[#6F6862]">We collect information you provide directly to us, such as your email address when you subscribe to our newsletter. We also collect anonymous usage data through analytics tools to improve our service.</p>
          </section>
          <section>
            <h2 className="font-serif text-[1.25rem] text-[#24211F] mb-2" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>2. How We Use Your Information</h2>
            <p className="text-[#6F6862]">We use your email address solely to send you recipe updates you have subscribed to. We do not sell, trade, or rent your personal information to third parties. Analytics data is used in aggregate to improve our website.</p>
          </section>
          <section>
            <h2 className="font-serif text-[1.25rem] text-[#24211F] mb-2" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>3. Cookies and Analytics</h2>
            <p className="text-[#6F6862]">We may use Google Analytics to understand how visitors use our site. This involves the use of cookies. You can opt out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" className="text-[#E4573D] hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.</p>
          </section>
          <section>
            <h2 className="font-serif text-[1.25rem] text-[#24211F] mb-2" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>4. Data Security</h2>
            <p className="text-[#6F6862]">We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
          </section>
          <section>
            <h2 className="font-serif text-[1.25rem] text-[#24211F] mb-2" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>5. Contact Us</h2>
            <p className="text-[#6F6862]">If you have questions about this privacy policy, please contact us at <a href="mailto:hello@recipet.com" className="text-[#E4573D] hover:underline">hello@recipet.com</a>.</p>
          </section>
        </div>
      </div>
    </PublicLayout>
  )
}
