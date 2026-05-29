'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { qrCodesApi } from '@/lib/api';

interface QRCodeData {
  id: string;
  data: string;
  imageUrl: string;
  fgColor: string;
  bgColor: string;
  scanCount: number;
  createdAt: string;
  link?: {
    shortCode: string;
    title: string | null;
  };
}

interface QRCodeFormState {
  data: string;
  fgColor: string;
  bgColor: string;
  size: string;
  format: 'png' | 'svg' | 'pdf';
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
}

const defaultFormState: QRCodeFormState = {
  data: '',
  fgColor: '#000000',
  bgColor: '#FFFFFF',
  size: '500',
  format: 'png',
  errorCorrection: 'H',
}

export default function QRCodesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdQRCode, setCreatedQRCode] = useState<QRCodeData | null>(null);
  const [form, setForm] = useState<QRCodeFormState>(defaultFormState);

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      const data = await qrCodesApi.getAll<QRCodeData[]>();
      setQrCodes(data);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setForm(defaultFormState);
    setError(null);
    setCreatedQRCode(null);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetCreateForm();
  };

  const handleCreateQRCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.data.trim()) {
      setError('Please enter a destination URL.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const created = await qrCodesApi.create<QRCodeData>({
        data: form.data.trim(),
        fgColor: form.fgColor,
        bgColor: form.bgColor,
        size: Number(form.size),
        format: form.format,
        errorCorrection: form.errorCorrection,
      });

      setCreatedQRCode(created);
      setQrCodes((current) => [created, ...current]);
      await fetchQRCodes();
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Failed to generate QR code.');
    } finally {
      setSubmitting(false);
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
                <Link href="/dashboard" className="px-4 py-2 rounded-lg font-medium text-[#8E9CB1] hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/dashboard/links" className="px-4 py-2 rounded-lg font-medium text-[#8E9CB1] hover:text-white transition-colors">
                  Links
                </Link>
                <Link href="/dashboard/qr-codes" className="px-4 py-2 rounded-lg font-medium bg-[#28C88C]/10 text-[#28C88C]">
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
              <Link href="/dashboard/profile" className="w-8 h-8 bg-[#28C88C] rounded-full flex items-center justify-center text-white font-semibold cursor-pointer">
                U
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">QR Codes</h1>
            <p className="text-[#8E9CB1]">Create and manage dynamic QR codes</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-[#28C88C] hover:bg-[#24B37D] text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Generate QR Code
          </button>
        </div>

        {/* QR Codes Grid */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-4 border-[#28C88C] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#8E9CB1] mt-4">Loading QR codes...</p>
            </div>
          ) : qrCodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qrCodes.map((qr) => (
                <Link key={qr.id} href={`/dashboard/qr-codes/${qr.id}`} className="block">
                <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-6 hover:border-[#28C88C] transition-colors">
                  <div className="flex items-center justify-center mb-4 bg-white rounded-lg p-4">
                    <img src={qr.imageUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white truncate">
                      {qr.link?.title || 'QR Code'}
                    </h3>
                    {qr.link && (
                      <p className="text-sm text-[#28C88C]">linktik.io/{qr.link.shortCode}</p>
                    )}
                    <p className="text-sm text-[#8E9CB1] truncate">{qr.data}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-[#8E9CB1]">
                        {qr.scanCount} scans
                      </span>
                      <div className="flex gap-2">
                        <button className="p-2 text-[#8E9CB1] hover:text-[#28C88C] transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button className="p-2 text-[#8E9CB1] hover:text-red-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[#28C88C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#28C88C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No QR codes yet</h3>
              <p className="text-[#8E9CB1] mb-6">Generate your first QR code to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-[#28C88C] hover:bg-[#24B37D] text-white rounded-xl font-semibold transition-colors"
              >
                Generate QR Code
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Create QR Code Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Generate QR Code</h3>
              <button
                onClick={closeCreateModal}
                className="text-[#8E9CB1] hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleCreateQRCode}>
              <div>
                <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                  Destination URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={form.data}
                  onChange={(event) => setForm((current) => ({ ...current, data: event.target.value }))}
                  className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                    Foreground Color
                  </label>
                  <input
                    type="color"
                    value={form.fgColor}
                    onChange={(event) => setForm((current) => ({ ...current, fgColor: event.target.value }))}
                    className="w-full h-12 bg-[#0F172A] border border-[#334155] rounded-xl cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={form.bgColor}
                    onChange={(event) => setForm((current) => ({ ...current, bgColor: event.target.value }))}
                    className="w-full h-12 bg-[#0F172A] border border-[#334155] rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                    Size
                  </label>
                  <select
                    value={form.size}
                    onChange={(event) => setForm((current) => ({ ...current, size: event.target.value }))}
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] text-white"
                  >
                    <option value="256">256 px</option>
                    <option value="384">384 px</option>
                    <option value="500">500 px</option>
                    <option value="750">750 px</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                    Format
                  </label>
                  <select
                    value={form.format}
                    onChange={(event) => setForm((current) => ({ ...current, format: event.target.value as QRCodeFormState['format'] }))}
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] text-white"
                  >
                    <option value="png">PNG</option>
                    <option value="svg">SVG</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                    Error Correction
                  </label>
                  <select
                    value={form.errorCorrection}
                    onChange={(event) => setForm((current) => ({ ...current, errorCorrection: event.target.value as QRCodeFormState['errorCorrection'] }))}
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] text-white"
                  >
                    <option value="L">L</option>
                    <option value="M">M</option>
                    <option value="Q">Q</option>
                    <option value="H">H</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {createdQRCode && (
                <div className="rounded-2xl border border-[#334155] bg-[#0F172A] p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Latest QR code</p>
                      <p className="text-xs text-[#8E9CB1] truncate">{createdQRCode.data}</p>
                    </div>
                    <a
                      href={createdQRCode.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-[#28C88C] hover:text-[#24B37D]"
                    >
                      Open image
                    </a>
                  </div>
                  <div className="flex items-center justify-center rounded-xl bg-white p-4">
                    <img src={createdQRCode.imageUrl} alt="Generated QR code" className="h-48 w-48 object-contain" />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="flex-1 px-4 py-3 border border-[#334155] text-white rounded-xl font-semibold hover:border-[#28C88C] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-[#28C88C] hover:bg-[#24B37D] disabled:bg-[#8E9CB1] text-white rounded-xl font-semibold transition-colors"
                >
                  {submitting ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
