import Link from 'next/link';

export default function FeaturesPage() {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      title: 'Custom Short Links',
      description: 'Create branded short links with custom aliases. Make your links memorable and professional.',
      benefits: ['Custom domains', 'Branded links', 'Easy to remember', 'Professional appearance']
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Advanced Analytics',
      description: 'Track every click with detailed analytics. Know your audience better with location, device, and browser data.',
      benefits: ['Real-time tracking', 'Geographic data', 'Device insights', 'Referrer tracking']
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      title: 'Dynamic QR Codes',
      description: 'Generate customizable QR codes for your links. Perfect for print materials, events, and offline marketing.',
      benefits: ['Customizable colors', 'High resolution', 'Trackable scans', 'Instant generation']
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      title: 'Event Management',
      description: 'Create and manage events with integrated ticketing. Sell tickets and track attendance seamlessly.',
      benefits: ['Ticket sales', 'QR code tickets', 'Attendance tracking', 'Multiple ticket types']
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime. Your links are always available when you need them.',
      benefits: ['SSL encryption', 'DDoS protection', 'Regular backups', '99.9% uptime']
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Lightning Fast',
      description: 'Optimized for speed with global CDN. Your links redirect in milliseconds, anywhere in the world.',
      benefits: ['Global CDN', 'Fast redirects', 'Optimized performance', 'Low latency']
    }
  ];

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

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Powerful Features for
            <span className="text-[#28C88C]"> Modern Marketers</span>
          </h1>
          <p className="text-xl text-[#8E9CB1] max-w-3xl mx-auto mb-8">
            Everything you need to create, manage, and track your links. Built for teams that demand more.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#1E293B] border border-[#334155] rounded-2xl p-8 hover:border-[#28C88C] transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="w-16 h-16 bg-[#28C88C]/10 rounded-xl flex items-center justify-center text-[#28C88C] mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-[#8E9CB1] mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#8E9CB1]">
                      <svg className="w-5 h-5 text-[#28C88C] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#28C88C]/10 to-[#28C88C]/5 border border-[#28C88C]/20 rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl text-[#8E9CB1] mb-8">
              Join thousands of marketers using LinkTik to power their campaigns.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-[#28C88C] hover:bg-[#24B37D] text-white rounded-xl font-semibold transition-colors text-lg shadow-lg"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-[#8E9CB1]">
          <p>&copy; 2026 LinkTik. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
