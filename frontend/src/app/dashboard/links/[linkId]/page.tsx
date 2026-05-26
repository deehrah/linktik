'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { linksApi, qrCodesApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

interface LinkDetails {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  title: string | null;
  description: string | null;
  clickCount: number;
  lastClickedAt: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LinkAnalytics {
  shortCode: string;
  totalClicks: number;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  clicksByDay: Array<{ clickedAt: string; _count: { id: number } }>;
  topCountries: Array<{ country: string | null; clicks: number }>;
  topDevices: Array<{ device: string | null; clicks: number }>;
  topBrowsers: Array<{ browser: string | null; clicks: number }>;
}

interface QRCodeItem {
  id: string;
  data: string;
  imageUrl: string;
  scanCount: number;
  link?: {
    shortCode: string;
    title: string | null;
  };
}

export default function LinkDetailPage() {
  const params = useParams();
  const linkId = params.linkId as string;

  const [link, setLink] = useState<LinkDetails | null>(null);
  const [analytics, setAnalytics] = useState<LinkAnalytics | null>(null);
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLinkDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const [linkData, analyticsData, qrCodeData] = await Promise.all([
          linksApi.getOne<LinkDetails>(linkId),
          linksApi.getAnalytics<LinkAnalytics>(linkId, 30),
          qrCodesApi.getAll<QRCodeItem[]>(),
        ]);

        setLink(linkData);
        setAnalytics(analyticsData);
        setQrCodes(qrCodeData || []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load link details');
      } finally {
        setLoading(false);
      }
    };

    if (linkId) {
      fetchLinkDetails();
    }
  }, [linkId]);

  const relatedQrCodes = useMemo(
    () => qrCodes.filter((qr) => qr.link?.shortCode === link?.shortCode),
    [link?.shortCode, qrCodes]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-[#8E9CB1]">
        Loading link details...
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
        <Card className="max-w-lg w-full">
          <CardTitle>Link not found</CardTitle>
          <CardDescription className="mt-2">{error || 'The requested link could not be loaded.'}</CardDescription>
          <div className="mt-6">
            <Link href="/dashboard/links" className="inline-flex px-4 py-2 rounded-lg bg-[#28C88C] text-white font-medium">
              Back to links
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="border-b border-[#334155] bg-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <Link href="/dashboard/links" className="text-sm text-[#28C88C] hover:text-[#24B37D]">
              ← Back to links
            </Link>
            <h1 className="text-2xl font-bold mt-2">{link.title || 'Untitled Link'}</h1>
            <p className="text-[#8E9CB1]">linktik.io/{link.shortCode}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${link.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {link.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid gap-6 md:grid-cols-4">
          <Card hover>
            <CardHeader>
              <CardDescription>Total clicks</CardDescription>
              <CardTitle>{link.clickCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card hover>
            <CardHeader>
              <CardDescription>Last clicked</CardDescription>
              <CardTitle>{link.lastClickedAt ? new Date(link.lastClickedAt).toLocaleString() : 'Never'}</CardTitle>
            </CardHeader>
          </Card>
          <Card hover>
            <CardHeader>
              <CardDescription>Created</CardDescription>
              <CardTitle>{new Date(link.createdAt).toLocaleDateString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card hover>
            <CardHeader>
              <CardDescription>Destination</CardDescription>
              <CardTitle className="truncate text-base">{link.originalUrl}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Link details</CardTitle>
              <CardDescription>Everything tied to this short link.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-[#8E9CB1]">Short URL</p>
                <a href={link.shortUrl} className="text-[#28C88C] hover:underline break-all">
                  {link.shortUrl}
                </a>
              </div>
              <div>
                <p className="text-sm text-[#8E9CB1]">Destination URL</p>
                <a href={link.originalUrl} className="text-white hover:underline break-all" target="_blank" rel="noreferrer">
                  {link.originalUrl}
                </a>
              </div>
              <div>
                <p className="text-sm text-[#8E9CB1]">Description</p>
                <p>{link.description || 'No description provided.'}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 text-sm text-[#8E9CB1]">
                <p>Expires: {link.expiresAt ? new Date(link.expiresAt).toLocaleString() : 'Never'}</p>
                <p>Updated: {new Date(link.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR codes</CardTitle>
              <CardDescription>QR codes connected to this link.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {relatedQrCodes.length > 0 ? (
                relatedQrCodes.map((qr) => (
                  <div key={qr.id} className="flex items-center gap-3 rounded-lg border border-[#334155] p-3">
                    <img src={qr.imageUrl} alt="QR code" className="h-16 w-16 rounded-lg bg-white object-contain" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{qr.link?.title || 'QR Code'}</p>
                      <p className="text-sm text-[#8E9CB1]">{qr.scanCount} scans</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#8E9CB1]">No QR codes are linked to this URL.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Top countries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics?.topCountries.length ? analytics.topCountries.map((item) => (
                <div key={item.country || 'unknown'} className="flex items-center justify-between text-sm">
                  <span>{item.country || 'Unknown'}</span>
                  <span className="text-[#8E9CB1]">{item.clicks}</span>
                </div>
              )) : <p className="text-sm text-[#8E9CB1]">No country data yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top devices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics?.topDevices.length ? analytics.topDevices.map((item) => (
                <div key={item.device || 'unknown'} className="flex items-center justify-between text-sm">
                  <span>{item.device || 'Unknown'}</span>
                  <span className="text-[#8E9CB1]">{item.clicks}</span>
                </div>
              )) : <p className="text-sm text-[#8E9CB1]">No device data yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top browsers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics?.topBrowsers.length ? analytics.topBrowsers.map((item) => (
                <div key={item.browser || 'unknown'} className="flex items-center justify-between text-sm">
                  <span>{item.browser || 'Unknown'}</span>
                  <span className="text-[#8E9CB1]">{item.clicks}</span>
                </div>
              )) : <p className="text-sm text-[#8E9CB1]">No browser data yet.</p>}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent clicks</CardTitle>
            <CardDescription>Latest recorded click activity for this link.</CardDescription>
          </CardHeader>
          <CardContent>
            {link && analytics ? (
              <div className="space-y-3">
                {(analytics.clicksByDay.length > 0 ? analytics.clicksByDay : []).length > 0 ? (
                  analytics.clicksByDay.slice().reverse().map((entry) => (
                    <div key={entry.clickedAt} className="flex items-center justify-between rounded-lg border border-[#334155] px-4 py-3 text-sm">
                      <span>{new Date(entry.clickedAt).toLocaleDateString()}</span>
                      <span className="text-[#8E9CB1]">{entry._count.id} clicks</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#8E9CB1]">No clicks recorded in the selected period.</p>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}