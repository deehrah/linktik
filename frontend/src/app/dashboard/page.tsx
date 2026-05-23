'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { linksApi, qrCodesApi, eventsApi } from '@/lib/api';

interface Stats {
  totalLinks: number;
  totalClicks: number;
  totalQRCodes: number;
  totalEvents: number;
}

interface RecentLink {
  id: string;
  shortCode: string;
  originalUrl: string;
  title: string | null;
  clickCount: number;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalLinks: 0,
    totalClicks: 0,
    totalQRCodes: 0,
    totalEvents: 0,
  });
  const [recentLinks, setRecentLinks] = useState<RecentLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    console.log('🔑 Token exists:', !!token);
    if (token) {
      console.log('🔑 Token (first 20 chars):', token.substring(0, 20));
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching dashboard data...');
      
      const [links, qrCodes, events] = await Promise.all([
        linksApi.getAll(),
        qrCodesApi.getAll(),
        eventsApi.getAll(),
      ]);

      console.log('✅ Data fetched:', { links, qrCodes, events });

      const totalClicks = links.reduce((sum: number, link: any) => sum + (link.clickCount || 0), 0);

      setStats({
        totalLinks: links.length,
        totalClicks,
        totalQRCodes: qrCodes.length,
        totalEvents: events.length,
      });

      setRecentLinks(links.slice(0, 5));
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <header className="bg-[#1E293B] border-b border-[#334155]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#28C88C] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LT</span>
                </div>
                <span className="text-xl font-bold text-white">LinkTik</span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-1">
                <Link href="/dashboard" className="px-4 py-2 rounded-lg font-medium bg-[#28C88C]/10 text-[#28C88C]">
                  Dashboard
                </Link>
                <Link href="/dashboard/links" className="px-4 py-2 rounded-lg font-medium text-[#8E9CB1] hover:text-white transition-colors">
                  Links
                </Link>
                <Link href="/dashboard/qr-codes" className="px-4 py-2 rounded-lg font-medium text-[#8E9CB1] hover:text-white transition-colors">
                  QR Codes
                </Link>
                <Link href="/dashboard/events" className="px-4 py-2 rounded-lg font-medium text-[#8E9CB1] hover:text-white transition-colors">
                  Events
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 text-[#8E9CB1] hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-[#28C88C] rounded-full flex items-center justify-center text-white font-semibold cursor-pointer">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1E293B] border border-[#334155] p-6 rounded-xl hover:border-[#28C88C] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#8E9CB1] text-sm font-medium">Total Links</h3>
              <div className="w-10 h-10 bg-[#28C88C]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#28C88C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{loading ? '...' : stats.totalLinks}</p>
            <p className="text-xs text-[#8E9CB1]">Active short links</p>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] p-6 rounded-xl hover:border-[#28C88C] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#8E9CB1] text-sm font-medium">Total Clicks</h3>
              <div className="w-10 h-10 bg-[#28C88C]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#28C88C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{loading ? '...' : stats.totalClicks}</p>
            <p className="text-xs text-[#8E9CB1]">Total link clicks</p>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] p-6 rounded-xl hover:border-[#28C88C] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#8E9CB1] text-sm font-medium">QR Codes</h3>
              <div className="w-10 h-10 bg-[#28C88C]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#28C88C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{loading ? '...' : stats.totalQRCodes}</p>
            <p className="text-xs text-[#8E9CB1]">Generated QR codes</p>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] p-6 rounded-xl hover:border-[#28C88C] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#8E9CB1] text-sm font-medium">Events</h3>
              <div className="w-10 h-10 bg-[#28C88C]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#28C88C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{loading ? '...' : stats.totalEvents}</p>
            <p className="text-xs text-[#8E9CB1]">Active events</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/links"
              className="flex items-center gap-4 p-4 bg-[#0F172A] border border-[#334155] rounded-xl hover:border-[#28C88C] transition-colors group"
            >
              <div className="w-12 h-12 bg-[#28C88C]/10 rounded-lg flex items-center justify-center group-hover:bg-[#28C88C]/20 transition-colors">
                <svg className="w-6 h-6 text-[#28C88C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white">Create Short Link</h3>
                <p className="text-sm text-[#8E9CB1]">Shorten a new URL</p>
              </div>
            </Link>

            <Link
              href="/dashboard/qr-codes"
              className="flex items-center gap-4 p-4 bg-[#0F172A] border border-[#334155] rounded-xl hover:border-[#28C88C] transition-colors group"
            >
              <div className="w-12 h-12 bg-[#28C88C]/10 rounded-lg flex items-center justify-center group-hover:bg-[#28C88C]/20 transition-colors">
                <svg className="w-6 h-6 text-[#28C88C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white">Generate QR Code</h3>
                <p className="text-sm text-[#8E9CB1]">Create a new QR code</p>
              </div>
            </Link>

            <Link
              href="/dashboard/events"
              className="flex items-center gap-4 p-4 bg-[#0F172A] border border-[#334155] rounded-xl hover:border-[#28C88C] transition-colors group"
            >
              <div className="w-12 h-12 bg-[#28C88C]/10 rounded-lg flex items-center justify-center group-hover:bg-[#28C88C]/20 transition-colors">
                <svg className="w-6 h-6 text-[#28C88C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white">Create Event</h3>
                <p className="text-sm text-[#8E9CB1]">Set up a new event</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Links */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Links</h2>
            <Link href="/dashboard/links" className="text-[#28C88C] hover:text-[#24B37D] font-medium text-sm transition-colors">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-[#28C88C] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#8E9CB1] mt-4">Loading...</p>
            </div>
          ) : recentLinks.length > 0 ? (
            <div className="space-y-3">
              {recentLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-4 bg-[#0F172A] border border-[#334155] rounded-xl hover:border-[#28C88C] transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{link.title || 'Untitled Link'}</h3>
                    <p className="text-sm text-[#8E9CB1] truncate">linktik.io/{link.shortCode}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{link.clickCount}</p>
                      <p className="text-xs text-[#8E9CB1]">clicks</p>
                    </div>
                    <button className="p-2 text-[#8E9CB1] hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#28C88C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#28C88C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No links yet</h3>
              <p className="text-[#8E9CB1] mb-6">Create your first short link to get started</p>
              <Link
                href="/dashboard/links"
                className="inline-block px-6 py-3 bg-[#28C88C] hover:bg-[#24B37D] text-white rounded-xl font-semibold transition-colors"
              >
                Create Short Link
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
