import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Navigation */}
      <nav className="sticky top-0 bg-[#0F172A]/95 backdrop-blur border-b border-[#1E293B] z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#28C88C] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LT</span>
            </div>
            <span className="text-xl font-bold text-white">LinkTik</span>
          </Link>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-5 py-2 text-[#8E9CB1] hover:text-white font-medium transition-colors text-sm"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 bg-[#28C88C] hover:bg-[#24B37D] text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold mb-4">Terms of Service</h1>
        <p className="text-[#8E9CB1] mb-12">Last updated: May 23, 2026</p>

        <div className="space-y-8 text-[#8E9CB1]">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using LinkTik (&quot;Service&quot;), you accept and agree to be bound by the terms and 
              provision of this agreement. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
            <p className="mb-4">
              Permission is granted to temporarily use LinkTik for personal or commercial purposes. This is the 
              grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose without proper subscription</li>
              <li>Attempt to decompile or reverse engineer any software contained on LinkTik</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
            <p className="mb-4">
              When you create an account with us, you must provide accurate, complete, and current information. 
              Failure to do so constitutes a breach of the Terms, which may result in immediate termination of 
              your account.
            </p>
            <p className="mb-4">
              You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Prohibited Uses</h2>
            <p className="mb-4">You may not use LinkTik:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload or transmit viruses or any other type of malicious code</li>
              <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Content</h2>
            <p className="mb-4">
              Our Service allows you to post, link, store, share and otherwise make available certain information, 
              text, graphics, or other material. You are responsible for the content that you post on or through 
              the Service.
            </p>
            <p className="mb-4">
              By posting content, you grant us the right and license to use, modify, publicly perform, publicly 
              display, reproduce, and distribute such content on and through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account immediately, without prior notice or liability, for any 
              reason whatsoever, including without limitation if you breach the Terms.
            </p>
            <p className="mb-4">
              Upon termination, your right to use the Service will immediately cease. If you wish to terminate 
              your account, you may simply discontinue using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
            <p className="mb-4">
              In no event shall LinkTik, nor its directors, employees, partners, agents, suppliers, or affiliates, 
              be liable for any indirect, incidental, special, consequential or punitive damages, including without 
              limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will 
              provide notice of any significant changes by posting the new Terms on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="mb-2">Email: legal@linktik.ng</p>
            <p>Address: 123 Innovation Drive, Victoria Island, Lagos, Nigeria</p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-[#8E9CB1]">
          <p>&copy; 2026 LinkTik. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
