import Link from 'next/link';

export default function PrivacyPage() {
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
        <h1 className="text-5xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-[#8E9CB1] mb-12">Last updated: May 23, 2026</p>

        <div className="space-y-8 text-[#8E9CB1]">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="mb-4">
              LinkTik (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains 
              how we collect, use, disclose, and safeguard your information when you use our Service.
            </p>
            <p className="mb-4">
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
              please do not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-white mb-3">Personal Information</h3>
            <p className="mb-4">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Name and email address</li>
              <li>Account credentials</li>
              <li>Payment information (processed securely through Paystack)</li>
              <li>Profile information</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">Usage Information</h3>
            <p className="mb-4">We automatically collect certain information when you use our Service:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>IP address and location data</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Pages visited and links clicked</li>
              <li>Time and date of visits</li>
              <li>Referring website addresses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process your transactions and send related information</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Provide analytics and insights about link performance</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, prevent, and address technical issues and fraudulent activity</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Analytics and Tracking</h2>
            <p className="mb-4">
              When someone clicks on your shortened links, we collect analytics data including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Geographic location (country, city, region)</li>
              <li>Device type and operating system</li>
              <li>Browser information</li>
              <li>Referrer information</li>
              <li>Time and date of click</li>
            </ul>
            <p className="mb-4">
              This data is aggregated and provided to you for analytics purposes. We do not sell this data to 
              third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Information Sharing</h2>
            <p className="mb-4">We may share your information in the following circumstances:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Service Providers:</strong> We share information with third-party service providers who perform services on our behalf</li>
              <li><strong>Payment Processors:</strong> Payment information is processed by Paystack according to their privacy policy</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to legal requests</li>
              <li><strong>Business Transfers:</strong> Information may be transferred in connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Data Security</h2>
            <p className="mb-4">
              We implement appropriate technical and organizational measures to protect your personal information. 
              However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
            <p className="mb-4">Security measures include:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>SSL/TLS encryption for data in transit</li>
              <li>Encrypted storage of sensitive data</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
              <li>Regular backups</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Export your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Data Retention</h2>
            <p className="mb-4">
              We retain your information for as long as necessary to provide our Service and fulfill the purposes 
              outlined in this Privacy Policy. When you delete your account, we will delete or anonymize your 
              personal information within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Cookies</h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to track activity on our Service. You can instruct 
              your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Children&apos;s Privacy</h2>
            <p className="mb-4">
              Our Service is not intended for children under 13 years of age. We do not knowingly collect personal 
              information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
            <p className="mb-4">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mb-2">Email: privacy@linktik.ng</p>
            <p className="mb-2">Phone: +234 800 LINKTIK</p>
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
