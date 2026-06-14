import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUrlStore } from '../store/urlStore';
import { useAnalyticsStore } from '../store/analyticsStore';
import toast from 'react-hot-toast';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { CardSkeleton, TableSkeleton } from '../components/Skeleton';
import { 
  Plus, 
  Copy, 
  Trash2, 
  Edit3, 
  QrCode, 
  ExternalLink, 
  Link2, 
  Calendar,
  MousePointerClick,
  CheckCircle,
  Clock,
  X,
  Download,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  FileDown,
  Upload,
  ChevronDown,
  ChevronUp,
  Check,
  Zap,
  Sparkles
} from 'lucide-react';

const Sparkline = ({ data = [], color = '#7C3AED' }) => {
  const width = 60;
  const height = 24;
  const rawData = data && data.length >= 2 ? data : [5, 6, 5, 8, 9, 7, 10];
  const max = Math.max(...rawData, 1);
  const min = Math.min(...rawData, 0);
  const points = rawData.map((val, index) => {
    const x = (index / (rawData.length - 1)) * width;
    const y = height - ((val - min) / (max - min)) * height - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="overflow-visible" width={width} height={height}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export default function Dashboard() {
  const { urls, totalCount, totalPages, currentPage, isLoading, fetchUrlsAction, createUrlAction, updateUrlAction, deleteUrlAction } = useUrlStore();
  const { dashboardSummary, fetchDashboardSummaryAction } = useAnalyticsStore();

  const getRedirectBaseUrl = () => {
    const host = window.location.host;
    if (host.includes('5173')) {
      return `${window.location.protocol}//${host.replace('5173', '5000')}`;
    }
    return window.location.origin;
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Selection states
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [newUrlData, setNewUrlData] = useState({ longUrl: '', customAlias: '', expiresAt: '' });
  const [editUrlData, setEditUrlData] = useState({ longUrl: '', expiresAt: '' });
  
  // Copy state feedback
  const [copiedId, setCopiedId] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [isQrSelectorOpen, setIsQrSelectorOpen] = useState(false);

  const handleExportUrlsCSV = () => {
    if (urls.length === 0) {
      toast.error('No links available to export.');
      return;
    }
    const headers = ['Short Code', 'Destination Link', 'Clicks', 'Status', 'Created Date', 'Expiration Date'];
    const rows = urls.map(u => [
      u.shortCode,
      u.longUrl,
      u.clicks,
      u.status,
      new Date(u.createdAt).toISOString(),
      u.expiresAt ? new Date(u.expiresAt).toISOString() : 'Never'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `all-links.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Successfully exported all links to CSV!');
  };

  const getClicksTodayTrend = () => {
    if (!dashboardSummary || !dashboardSummary.dailyClicks || dashboardSummary.dailyClicks.length < 2) {
      return { pct: '+12.5%', isUp: true };
    }
    const clicks = dashboardSummary.dailyClicks;
    const today = clicks[clicks.length - 1]?.clicks || 0;
    const yesterday = clicks[clicks.length - 2]?.clicks || 0;
    if (yesterday === 0) {
      return { pct: today > 0 ? '+100%' : '0%', isUp: today > 0 };
    }
    const diff = today - yesterday;
    const pct = ((diff / yesterday) * 100).toFixed(1);
    return {
      pct: diff >= 0 ? `+${pct}%` : `${pct}%`,
      isUp: diff >= 0
    };
  };

  useEffect(() => {
    // Initial fetch of metrics and link table
    fetchDashboardSummaryAction().catch(() => {});
    fetchUrlsAction({ page, search: searchQuery, status: statusFilter }).catch(() => {});
  }, [page, searchQuery, statusFilter]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleCopyLink = (urlObj) => {
    // Construct redirect link
    const redirectLink = `${getRedirectBaseUrl()}/${urlObj.shortCode}`;
    navigator.clipboard.writeText(redirectLink);
    setCopiedId(urlObj._id);
    toast.success('Short link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    if (!newUrlData.longUrl) {
      toast.error('Destination URL is required');
      return;
    }

    try {
      const created = await createUrlAction(newUrlData);
      toast.success('Link shortened successfully!');
      setNewUrlData({ longUrl: '', customAlias: '', expiresAt: '' });
      setIsCreateOpen(false);
      // Refresh summary metrics
      fetchDashboardSummaryAction().catch(() => {});
    } catch (err) {
      toast.error(err.message || 'Failed to shorten URL');
    }
  };

  const handleEditLink = async (e) => {
    e.preventDefault();
    if (!editUrlData.longUrl) {
      toast.error('Destination URL is required');
      return;
    }

    try {
      await updateUrlAction(selectedUrl._id, editUrlData);
      toast.success('Link updated successfully!');
      setIsEditOpen(false);
      setSelectedUrl(null);
    } catch (err) {
      toast.error(err.message || 'Failed to update URL');
    }
  };

  const handleDeleteLink = async () => {
    try {
      await deleteUrlAction(selectedUrl._id);
      toast.success('Link deleted successfully!');
      setIsDeleteOpen(false);
      setSelectedUrl(null);
      // Refresh summary metrics
      fetchDashboardSummaryAction().catch(() => {});
    } catch (err) {
      toast.error(err.message || 'Failed to delete URL');
    }
  };

  // Helper for status classes
  const getStatusBadge = (status, expiresAt) => {
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Expired
        </span>
      );
    }
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Draft
      </span>
    );
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            Overview <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Create shortened URLs, retrieve QR Codes, and track click statistics
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Shorten Link</span>
        </button>
      </div>

      {/* Aggregate metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {!dashboardSummary ? (
          [...Array(4)].map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            {/* Total Links */}
            <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl flex flex-col justify-between hover-premium hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Links</p>
                  <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{dashboardSummary.cards.totalLinks}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                  <Link2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-light/40 dark:border-border-dark/40">
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                  <TrendingUp className="w-3.5 h-3.5" /> +4.3%
                </span>
                <Sparkline data={[Math.max(0, dashboardSummary.cards.totalLinks - 2), Math.max(0, dashboardSummary.cards.totalLinks - 1), dashboardSummary.cards.totalLinks]} color="#6366f1" />
              </div>
            </div>

            {/* Total Clicks */}
            <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl flex flex-col justify-between hover-premium hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Clicks</p>
                  <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{dashboardSummary.cards.totalClicks}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                  <MousePointerClick className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-light/40 dark:border-border-dark/40">
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                  <TrendingUp className="w-3.5 h-3.5" /> +12.5%
                </span>
                <Sparkline data={dashboardSummary.dailyClicks?.map(d => d.clicks)} color="#10b981" />
              </div>
            </div>

            {/* Active Links */}
            <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl flex flex-col justify-between hover-premium hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Active Links</p>
                  <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{dashboardSummary.cards.activeLinks}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-light/40 dark:border-border-dark/40">
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                  <TrendingUp className="w-3.5 h-3.5" /> +2.1%
                </span>
                <Sparkline data={[Math.max(0, dashboardSummary.cards.activeLinks - 1), dashboardSummary.cards.activeLinks, dashboardSummary.cards.activeLinks]} color="#3b82f6" />
              </div>
            </div>

            {/* Clicks Today */}
            <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl flex flex-col justify-between hover-premium hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Clicks Today</p>
                  <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{dashboardSummary.cards.clicksToday}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-light/40 dark:border-border-dark/40">
                {(() => {
                  const trend = getClicksTodayTrend();
                  return (
                    <span className={`flex items-center gap-1 text-xs font-bold ${trend.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {trend.isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {trend.pct}
                    </span>
                  );
                })()}
                <Sparkline data={dashboardSummary.dailyClicks?.slice(-3).map(d => d.clicks)} color="#f59e0b" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions Section */}
      <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-5 rounded-2xl space-y-3 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500 animate-pulse" /> Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-800/60 hover:bg-indigo-600 hover:text-white rounded-xl text-sm font-bold transition-all text-zinc-800 dark:text-zinc-200 border border-border-light dark:border-border-dark"
          >
            <Plus className="w-4 h-4" />
            Create Link
          </button>
          <button
            onClick={() => toast.success('Bulk import feature is coming soon!')}
            className="flex items-center justify-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-800/60 hover:bg-indigo-600 hover:text-white rounded-xl text-sm font-bold transition-all text-zinc-800 dark:text-zinc-200 border border-border-light dark:border-border-dark"
          >
            <Upload className="w-4 h-4" />
            Bulk Import
          </button>
          <button
            onClick={handleExportUrlsCSV}
            className="flex items-center justify-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-800/60 hover:bg-indigo-600 hover:text-white rounded-xl text-sm font-bold transition-all text-zinc-800 dark:text-zinc-200 border border-border-light dark:border-border-dark"
          >
            <FileDown className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setIsQrSelectorOpen(true)}
            className="flex items-center justify-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-800/60 hover:bg-indigo-600 hover:text-white rounded-xl text-sm font-bold transition-all text-zinc-800 dark:text-zinc-200 border border-border-light dark:border-border-dark"
          >
            <QrCode className="w-4 h-4" />
            Generate QR
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4 rounded-xl">
        <SearchBar value={searchQuery} onChange={(val) => { setSearchQuery(val); setPage(1); }} placeholder="Search links by destination or code..." />
        
        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Main Table Panel */}
      {isLoading && urls.length === 0 ? (
        <TableSkeleton />
      ) : urls.length === 0 ? (
        <EmptyState 
          title="No shortened URLs yet" 
          description="It looks like you haven't created any links. Get started by shortening your first destination URL!"
          actionButton={
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all"
            >
              Shorten URL
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden border border-border-light dark:border-border-dark rounded-xl bg-card-light dark:bg-card-dark">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-border-light dark:border-border-dark">
                  <th className="px-6 py-4">Short Code / Title</th>
                  <th className="px-6 py-4">Destination Link</th>
                  <th className="px-6 py-4">Clicks</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
                {urls.map((urlObj) => {
                  const redirectLink = `${getRedirectBaseUrl()}/${urlObj.shortCode}`;
                  const isExpanded = expandedRowId === urlObj._id;
                  return (
                    <React.Fragment key={urlObj._id}>
                      <tr 
                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-all duration-200 cursor-pointer active:scale-[0.99]"
                        onClick={() => setExpandedRowId(isExpanded ? null : urlObj._id)}
                      >
                        
                        {/* Short Link / Custom Alias */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-zinc-400">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </span>
                            <div className="space-y-0.5">
                              <a 
                                href={redirectLink}
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center space-x-1.5 font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span>/{urlObj.shortCode}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              {urlObj.customAlias && (
                                <p className="text-xs text-zinc-400 font-medium">Alias: {urlObj.customAlias}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Long URL Destination */}
                        <td className="px-6 py-4 max-w-xs truncate text-zinc-500 dark:text-zinc-400 font-medium">
                          <span title={urlObj.longUrl}>{urlObj.longUrl}</span>
                        </td>

                        {/* Clicks */}
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-zinc-700 dark:text-zinc-200">
                          {urlObj.clicks}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(urlObj.status, urlObj.expiresAt)}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-400 font-semibold">
                          {new Date(urlObj.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>

                        {/* Row Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-zinc-400" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleCopyLink(urlObj)}
                              className="p-1.5 border border-border-light dark:border-border-dark rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors"
                              title="Copy Short URL"
                            >
                              {copiedId === urlObj._id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => { setSelectedUrl(urlObj); setIsQrOpen(true); }}
                              className="p-1.5 border border-border-light dark:border-border-dark rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors"
                              title="View QR Code"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/analytics/${urlObj._id}`}
                              className="p-1.5 border border-border-light dark:border-border-dark rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors"
                              title="View Analytics"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                            </Link>
                            <button
                              onClick={() => { 
                                setSelectedUrl(urlObj); 
                                setEditUrlData({ longUrl: urlObj.longUrl, expiresAt: urlObj.expiresAt ? urlObj.expiresAt.substring(0, 10) : '' }); 
                                setIsEditOpen(true); 
                              }}
                              className="p-1.5 border border-border-light dark:border-border-dark rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors"
                              title="Edit Link"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setSelectedUrl(urlObj); setIsDeleteOpen(true); }}
                              className="p-1.5 border border-red-500/20 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                              title="Delete Link"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                      {isExpanded && (
                        <tr className="bg-zinc-50/20 dark:bg-zinc-900/10 transition-all duration-300">
                          <td colSpan={6} className="px-8 py-5 border-t border-b border-border-light dark:border-border-dark">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1.5">Destination Link</p>
                                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 select-all break-all">{urlObj.longUrl}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1.5">Created Date</p>
                                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                                    {new Date(urlObj.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1.5">Expiration</p>
                                  <p className={`text-sm font-semibold ${urlObj.expiresAt ? 'text-rose-500' : 'text-zinc-500'}`}>
                                    {urlObj.expiresAt ? new Date(urlObj.expiresAt).toLocaleString() : 'Never'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}

      {/* CREATE LINK MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-border-light dark:border-border-dark">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Shorten a new URL</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLink} className="p-6 space-y-4">
              
              {/* Long URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Destination URL *</label>
                <input
                  type="url"
                  required
                  value={newUrlData.longUrl}
                  onChange={(e) => setNewUrlData({ ...newUrlData, longUrl: e.target.value })}
                  placeholder="https://example.com/very-long-link-slug-details"
                  className="block w-full px-3 py-2 text-sm bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Custom Alias */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Custom Alias (Optional)</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border-light dark:border-border-dark bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xs">
                    /
                  </span>
                  <input
                    type="text"
                    value={newUrlData.customAlias}
                    onChange={(e) => setNewUrlData({ ...newUrlData, customAlias: e.target.value })}
                    placeholder="my-custom-slug"
                    className="block w-full px-3 py-2 text-sm bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-r-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Link Expiration (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={newUrlData.expiresAt}
                    onChange={(e) => setNewUrlData({ ...newUrlData, expiresAt: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="block w-full pl-10 pr-3 py-2 text-sm bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border-light dark:border-border-dark">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-semibold border border-border-light dark:border-border-dark rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all"
                >
                  Create
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT LINK MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-border-light dark:border-border-dark">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Edit shortened link</h3>
              <button onClick={() => setIsEditOpen(false)} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditLink} className="p-6 space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Destination URL *</label>
                <input
                  type="url"
                  required
                  value={editUrlData.longUrl}
                  onChange={(e) => setEditUrlData({ ...editUrlData, longUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="block w-full px-3 py-2 text-sm bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Link Expiration (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={editUrlData.expiresAt}
                    onChange={(e) => setEditUrlData({ ...editUrlData, expiresAt: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2 text-sm bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border-light dark:border-border-dark">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-sm font-semibold border border-border-light dark:border-border-dark rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* QR CODE VIEW MODAL */}
      {isQrOpen && selectedUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-border-light dark:border-border-dark">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">QR Code</h3>
              <button onClick={() => { setIsQrOpen(false); setSelectedUrl(null); }} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center justify-center space-y-6">
              <div className="p-4 bg-white border border-zinc-200 rounded-lg shadow-inner">
                <img 
                  src={selectedUrl.qrCode} 
                  alt={`QR code for ${selectedUrl.shortCode}`} 
                  className="w-48 h-48 block"
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">/{selectedUrl.shortCode}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-[200px] truncate">{selectedUrl.longUrl}</p>
              </div>
              <a
                href={selectedUrl.qrCode}
                download={`qrcode-${selectedUrl.shortCode}.png`}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-md transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Image</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* DELETE LINK CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedUrl(null); }}
        onConfirm={handleDeleteLink}
        title="Delete Short Link"
        message="Are you sure you want to delete this shortened link? All associated visit statistics and click history will be permanently deleted. This action cannot be undone."
        confirmText="Delete Link"
      />

      {/* QR SELECTOR MODAL */}
      {isQrSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-border-light dark:border-border-dark">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Select Link for QR Code</h3>
              <button onClick={() => setIsQrSelectorOpen(false)} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              {urls.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center">No links available</p>
              ) : (
                <div className="space-y-2">
                  {urls.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => {
                        setSelectedUrl(u);
                        setIsQrOpen(true);
                        setIsQrSelectorOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border-light dark:border-border-dark hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors"
                    >
                      <div className="truncate pr-4">
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">/{u.shortCode}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{u.longUrl}</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
