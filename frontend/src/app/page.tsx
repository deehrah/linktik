'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [typedText, setTypedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = ['marketers', 'developers', 'creators', 'businesses', 'teams', 'event managers'];

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Typing animation effect
  useEffect(() => {
    const currentWord = words[currentWordIndex];
    let currentIndex = 0;
    let isDeleting = false;
    let timeout: NodeJS.Timeout;

    const type = () => {
      if (!isDeleting && currentIndex <= currentWord.length) {
        setTypedText(currentWord.substring(0, currentIndex));
        currentIndex++;
        timeout = setTimeout(type, 100);
      } else if (!isDeleting && currentIndex > currentWord.length) {
        timeout = setTimeout(() => {
          isDeleting = true;
          type();
        }, 2000);
      } else if (isDeleting && currentIndex >= 0) {
        setTypedText(currentWord.substring(0, currentIndex));
        currentIndex--;
        timeout = setTimeout(type, 50);
      } else if (isDeleting && currentIndex < 0) {
        isDeleting = false;
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }
    };

    type();

    return () => clearTimeout(timeout);
  }, [currentWordIndex, words]);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // For demo purposes - in production this would call your API
      // For now, just show a demo short URL
      setTimeout(() => {
        setShortUrl(`linktik.io/${Math.random().toString(36).substring(7)}`);
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError('Failed to shorten URL. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Navigation */}
      <nav className="sticky top-0 bg-[#0F172A]/95 backdrop-blur border-b border-[#1E293B] z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#28C88C] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LT</span>
            </div>
            <span className="text-xl font-bold text-white">LinkTik</span>
          </div>
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
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Link Shortener */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-[#0F172A]">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            Short links for{' '}
            <span className="text-[#28C88C]">
              {typedText}
              <span className="animate-pulse">|</span>
            </span>
          </h1>
          <p className="text-xl text-[#8E9CB1] mb-12 max-w-3xl mx-auto">
            A URL shortener built with powerful tools to help you grow and protect your brand.
          </p>

          {/* Link Shortener Form */}
          <div className="max-w-3xl mx-auto mb-8">
            <form onSubmit={handleShorten} className="bg-[#1E293B] rounded-2xl shadow-xl border border-[#334155] p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  placeholder="Paste your long URL here"
                  className="flex-1 px-5 py-4 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1] text-lg"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-4 bg-[#28C88C] hover:bg-[#24B37D] disabled:bg-[#8E9CB1] text-white rounded-xl font-semibold transition-colors text-lg shadow-lg hover:shadow-xl"
                >
                  {isLoading ? 'Shortening...' : 'Shorten'}
                </button>
              </div>
              {error && (
                <p className="mt-3 text-red-500 text-sm text-left">{error}</p>
              )}
              {shortUrl && (
                <div className="mt-4 p-4 bg-[#28C88C]/10 rounded-xl border border-[#28C88C]/30">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 text-left">
                      <p className="text-sm text-[#8E9CB1] mb-1">Your short link:</p>
                      <p className="text-lg font-semibold text-[#28C88C]">{shortUrl}</p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(shortUrl)}
                      className="px-4 py-2 bg-[#28C88C] hover:bg-[#24B37D] text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </form>
            <p className="mt-4 text-sm text-[#8E9CB1]">
              By clicking &quot;Shorten&quot;, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="px-8 py-3 bg-[#28C88C] hover:bg-[#24B37D] text-white rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              Get started for free
            </Link>
            <p className="text-sm text-[#8E9CB1]">✓ No credit card required</p>
          </div>
        </div>
      </section>

      {/* Trusted By Section - Marquee */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#1E293B] border-y border-[#334155] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-[#8E9CB1] mb-8 uppercase tracking-wide font-semibold text-center">Trusted by teams at</p>
          <div className="relative">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-16 mx-8">
                  <div className="text-2xl font-bold text-[#8E9CB1]/60">Microsoft</div>
                  <div className="text-2xl font-bold text-[#8E9CB1]/60">Google</div>
                  <div className="text-2xl font-bold text-[#8E9CB1]/60">Amazon</div>
                  <div className="text-2xl font-bold text-[#8E9CB1]/60">Meta</div>
                  <div className="text-2xl font-bold text-[#8E9CB1]/60">Apple</div>
                  <div className="text-2xl font-bold text-[#8E9CB1]/60">Netflix</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Powerful features for modern teams
            </h2>
            <p className="text-xl text-[#8E9CB1] max-w-3xl mx-auto">
              Everything you need to create, manage, and track your links
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                ),
                title: 'Branded short links', 
                desc: 'Create custom short links with your own domain to build trust and brand recognition.'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Advanced analytics', 
                desc: 'Track clicks, locations, devices, referrers and more with real-time analytics.'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                ),
                title: 'Dynamic QR codes', 
                desc: 'Generate QR codes that you can edit anytime without reprinting.'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                ),
                title: 'Event management', 
                desc: 'Create events, sell tickets, and manage attendees all in one place.'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: 'Team collaboration', 
                desc: 'Work together with your team with shared workspaces and permissions.'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                ),
                title: 'API access', 
                desc: 'Integrate LinkTik into your apps with our powerful REST API.'
              },
            ].map((feature, idx) => (
              <div key={idx} className="group">
                <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-8 hover:border-[#28C88C] transition-all duration-300 h-full">
                  <div className="w-14 h-14 bg-[#28C88C]/10 text-[#28C88C] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#28C88C]/20 transition-all">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-[#8E9CB1] leading-relaxed">{feature.desc}</p>
                  <a href="#" className="inline-flex items-center gap-2 text-[#28C88C] hover:text-[#24B37D] font-medium text-sm mt-4 group-hover:gap-3 transition-all">
                    Learn more 
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white">Trusted by thousands worldwide</h2>
            <p className="text-xl text-[#8E9CB1]">Join the growing community of LinkTik users</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { stat: '10M+', label: 'Links created' },
              { stat: '500M+', label: 'Clicks tracked' },
              { stat: '50K+', label: 'Active users' },
              { stat: '99.9%', label: 'Uptime SLA' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl font-bold mb-2 text-[#28C88C]">{item.stat}</div>
                <p className="text-[#8E9CB1] text-lg">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#1E293B]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Built for every team</h2>
            <p className="text-xl text-[#8E9CB1]">No matter your industry, LinkTik has you covered</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Marketing teams',
                desc: 'Track campaign performance and optimize conversions with detailed analytics',
                features: ['Campaign tracking', 'UTM parameters', 'A/B testing', 'ROI measurement']
              },
              {
                title: 'Sales teams',
                desc: 'Create personalized links and track engagement with prospects',
                features: ['Lead tracking', 'Custom links', 'Performance metrics', 'Team dashboards']
              },
              {
                title: 'Event organizers',
                desc: 'Manage events, tickets, and attendee tracking seamlessly',
                features: ['Ticket sales', 'QR validation', 'Entry scanning', 'Real-time analytics']
              },
            ].map((useCase, idx) => (
              <div key={idx} className="bg-[#0F172A] border border-[#334155] rounded-2xl p-8 hover:border-[#28C88C] transition-all duration-300">
                <h3 className="text-2xl font-bold text-white mb-3">{useCase.title}</h3>
                <p className="text-[#8E9CB1] mb-6 leading-relaxed">{useCase.desc}</p>
                <ul className="space-y-3">
                  {useCase.features.map((feature, fidx) => (
                    <li key={fidx} className="text-[#F1F5F9] flex items-center gap-3">
                      <svg className="w-5 h-5 text-[#28C88C] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0F172A]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-[#8E9CB1] mb-10">
            Join thousands of teams managing their links with LinkTik
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/signup"
              className="px-10 py-4 bg-[#28C88C] hover:bg-[#24B37D] text-white rounded-xl font-semibold transition-colors text-lg shadow-lg hover:shadow-xl"
            >
              Get started for free
            </Link>
            <Link
              href="/login"
              className="px-10 py-4 border-2 border-[#334155] hover:border-[#28C88C] text-white hover:text-[#28C88C] rounded-xl font-semibold transition-colors text-lg"
            >
              Sign in
            </Link>
          </div>
          <p className="text-[#8E9CB1]">No credit card required • Free forever plan available</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E293B] border-t border-[#334155] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#28C88C] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LT</span>
                </div>
                <span className="text-xl font-bold text-white">LinkTik</span>
              </div>
              <p className="text-sm text-[#8E9CB1] leading-relaxed">
                The modern link management platform for teams that want to grow.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-[#8E9CB1] hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="text-[#8E9CB1] hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-[#8E9CB1] hover:text-white transition-colors">API</Link></li>
                <li><Link href="#" className="text-[#8E9CB1] hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-[#8E9CB1] hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="text-[#8E9CB1] hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-[#8E9CB1] hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="text-[#8E9CB1] hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-[#8E9CB1] hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="text-[#8E9CB1] hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="text-[#8E9CB1] hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="text-[#8E9CB1] hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#334155] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#8E9CB1]">&copy; 2026 LinkTik. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-[#8E9CB1] hover:text-[#28C88C] transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
              </a>
              <a href="#" className="text-[#8E9CB1] hover:text-[#28C88C] transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/></svg>
              </a>
              <a href="#" className="text-[#8E9CB1] hover:text-[#28C88C] transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
