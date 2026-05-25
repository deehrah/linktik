'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { linksApi } from '@/lib/api';

interface LinkData {
  id: string;
  shortCode: string;
  originalUrl: string;
  title: string | null;
  clickCount: number;
  createdAt: string;
}

export default function LinksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLink, setSelectedLink] = useState<LinkData | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    originalUrl: '',
    shortCode: '',
    title: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const data = await linksApi.getAll();
      setLinks(data);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLinks = links.filter(link => 
    link.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      await linksApi.create({
        originalUrl: formData.originalUrl,
        customSlug: formData.shortCode || undefined,
        title: formData.title || undefined,
      });
      
      setSuccessMessage('Link created successfully!');
      setShowCreateModal(false);
      setFormData({ originalUrl: '', shortCode: '', title: '' });
      fetchLinks();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setFormError(error.message || 'Failed to create link');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLink) return;

    setFormLoading(true);
    setFormError('');

    try {
      await linksApi.update(selectedLink.id, {
        originalUrl: formData.originalUrl,
        title: formData.title || undefined,
      });
      
      setSuccessMessage('Link updated successfully!');
      setShowEditModal(false);
      setSelectedLink(null);
      setFormData({ originalUrl: '', shortCode: '', title: '' });
      fetchLinks();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setFormError(error.message || 'Failed to update link');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLink) return;

    setFormLoading(true);
    setFormError('');

    try {
      await linksApi.delete(selectedLink.id);
      
      setSuccessMessage('Link deleted successfully!');
      setShowDeleteModal(false);
      setSelectedLink(null);
      fetchLinks();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setFormError(error.message || 'Failed to delete link');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (link: LinkData) => {
    setSelectedLink(link);
    setFormData({
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
      title: link.title || '',
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (link: LinkData) => {
    setSelectedLink(link);
    setShowDeleteModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(`http://localhost:5000/${text}`);
    setSuccessMessage('Link copied to clipboard!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-[#28C88C] text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {successMessage}
        </div>
      )}
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
                <Link href="/dashboard/links" className="px-4 py-2 rounded-lg font-medium bg-[#28C88C]/10 text-[#28C88C]">
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Links</h1>
            <p className="text-[#8E9CB1]">Manage all your short links</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-[#28C88C] hover:bg-[#24B37D] text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Link
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="w-5 h-5 text-[#8E9CB1] absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search links..."
                className="w-full pl-12 pr-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
              />
            </div>
            <select className="px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] text-white">
              <option>All Links</option>
              <option>Active</option>
              <option>Archived</option>
            </select>
            <select className="px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] text-white">
              <option>Sort by Date</option>
              <option>Sort by Clicks</option>
              <option>Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Links Table */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-4 border-[#28C88C] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#8E9CB1] mt-4">Loading links...</p>
            </div>
          ) : filteredLinks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0F172A] border-b border-[#334155]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#8E9CB1] uppercase tracking-wider">
                      Short Link
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#8E9CB1] uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#8E9CB1] uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#8E9CB1] uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-[#8E9CB1] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {filteredLinks.map((link) => (
                    <tr key={link.id} className="hover:bg-[#0F172A] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-white">{link.title || 'Untitled'}</p>
                          <p className="text-sm text-[#28C88C]">linktik.io/{link.shortCode}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#8E9CB1] truncate max-w-xs">{link.originalUrl}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-[#28C88C]/10 text-[#28C88C] rounded-full text-sm font-semibold">
                          {link.clickCount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#8E9CB1]">
                          {new Date(link.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => copyToClipboard(link.shortCode)}
                            className="p-2 text-[#8E9CB1] hover:text-[#28C88C] transition-colors"
                            title="Copy link"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => openEditModal(link)}
                            className="p-2 text-[#8E9CB1] hover:text-[#28C88C] transition-colors"
                            title="Edit link"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => openDeleteModal(link)}
                            className="p-2 text-[#8E9CB1] hover:text-red-500 transition-colors"
                            title="Delete link"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[#28C88C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#28C88C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No links yet</h3>
              <p className="text-[#8E9CB1] mb-6">Create your first short link to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-[#28C88C] hover:bg-[#24B37D] text-white rounded-xl font-semibold transition-colors"
              >
                Create Short Link
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Create Link Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create Short Link</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#8E9CB1] hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                  Destination URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.originalUrl}
                  onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                  placeholder="https://example.com/your-long-url"
                  className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                  Custom Alias (Optional)
                </label>
                <div className="flex gap-2">
                  <span className="px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl text-[#8E9CB1]">
                    linktik.io/
                  </span>
                  <input
                    type="text"
                    value={formData.shortCode}
                    onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                    placeholder="my-link"
                    className="flex-1 px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="My Link Title"
                  className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ originalUrl: '', shortCode: '', title: '' });
                    setFormError('');
                  }}
                  disabled={formLoading}
                  className="flex-1 px-4 py-3 border border-[#334155] text-white rounded-xl font-semibold hover:border-[#28C88C] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-3 bg-[#28C88C] hover:bg-[#24B37D] text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Link'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Link Modal */}
      {showEditModal && selectedLink && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit Link</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedLink(null);
                  setFormData({ originalUrl: '', shortCode: '', title: '' });
                  setFormError('');
                }}
                className="text-[#8E9CB1] hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                  Destination URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.originalUrl}
                  onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                  placeholder="https://example.com/your-long-url"
                  className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                  Short Code (Cannot be changed)
                </label>
                <div className="flex gap-2">
                  <span className="px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl text-[#8E9CB1]">
                    linktik.io/
                  </span>
                  <input
                    type="text"
                    value={formData.shortCode}
                    disabled
                    className="flex-1 px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl text-[#8E9CB1] opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="My Link Title"
                  className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedLink(null);
                    setFormData({ originalUrl: '', shortCode: '', title: '' });
                    setFormError('');
                  }}
                  disabled={formLoading}
                  className="flex-1 px-4 py-3 border border-[#334155] text-white rounded-xl font-semibold hover:border-[#28C88C] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-3 bg-[#28C88C] hover:bg-[#24B37D] text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Link'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedLink && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Delete Link</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedLink(null);
                  setFormError('');
                }}
                className="text-[#8E9CB1] hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {formError}
              </div>
            )}

            <div className="mb-6">
              <p className="text-[#8E9CB1] mb-4">
                Are you sure you want to delete this link? This action cannot be undone.
              </p>
              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
                <p className="font-semibold text-white mb-1">{selectedLink.title || 'Untitled'}</p>
                <p className="text-sm text-[#28C88C]">linktik.io/{selectedLink.shortCode}</p>
                <p className="text-sm text-[#8E9CB1] mt-2 truncate">{selectedLink.originalUrl}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedLink(null);
                  setFormError('');
                }}
                disabled={formLoading}
                className="flex-1 px-4 py-3 border border-[#334155] text-white rounded-xl font-semibold hover:border-[#28C88C] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={formLoading}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {formLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Link'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
