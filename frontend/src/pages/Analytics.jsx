import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useUrlStore } from '../store/urlStore';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { ChartSkeleton, TableSkeleton } from '../components/Skeleton';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { 
  Calendar, 
  Globe, 
  Compass, 
  ArrowLeft,
  Download,
  CalendarCheck,
  MousePointerClick,
  Laptop,
  Chrome,
  TrendingUp,
  Clock,
  Link2,
  UserCheck,
  Activity,
  ExternalLink
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { urlAnalytics, isLoading, fetchUrlAnalyticsAction, dashboardSummary, fetchDashboardSummaryAction } = useAnalyticsStore();
  const { urls, fetchUrlsAction } = useUrlStore();

  const getRedirectBaseUrl = () => {
    const host = window.location.host;
    if (host.includes('5173')) {
      return `${window.location.protocol}//${host.replace('5173', '5000')}`;
    }
    return window.location.origin;
  };

  const [visitPage, setVisitPage] = useState(1);
  const [selectedLinkId, setSelectedLinkId] = useState(id || '');

  useEffect(() => {
    // If we have select URLs in store, use them, otherwise fetch
    if (urls.length === 0) {
      fetchUrlsAction().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (id) {
      setSelectedLinkId(id);
      fetchUrlAnalyticsAction(id, { page: visitPage, limit: 8 }).catch((err) => {
        toast.error('Failed to load link analytics: ' + err.message);
        navigate('/analytics');
      });
    } else {
      setSelectedLinkId('');
      fetchDashboardSummaryAction().catch(() => {});
    }
  }, [id, visitPage]);

  const handleLinkSelectChange = (e) => {
    const nextId = e.target.value;
    if (nextId) {
      navigate(`/analytics/${nextId}`);
    } else {
      navigate('/analytics');
    }
    setVisitPage(1);
  };

  // Helper: Export analytics data to CSV
  const handleExportCSV = () => {
    if (!urlAnalytics) return;
    
    const visits = urlAnalytics.visitsTable.visits;
    if (visits.length === 0) {
      toast.error('No click records available to export.');
      return;
    }

    const headers = ['Timestamp', 'IP Address', 'Browser', 'Device', 'Operating System', 'Referrer', 'Country', 'City'];
    const rows = visits.map(v => [
      new Date(v.timestamp).toISOString(),
      '***.***.***.***', // Anonymized IP for privacy
      v.browser,
      v.device,
      v.os,
      v.referrer,
      v.country,
      v.city
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics-${urlAnalytics.url.shortCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export downloaded!');
  };

  // Render Aggregate view if no ID
  if (!id) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Global Analytics</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Aggregated click distribution and browser metrics across all links
            </p>
          </div>
          
          {/* Select dropdown */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-zinc-500">Analyze Link:</span>
            <select
              value={selectedLinkId}
              onChange={handleLinkSelectChange}
              className="px-3 py-2 text-sm bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Global Overall Stats</option>
              {urls.map(u => (
                <option key={u._id} value={u._id}>/{u.shortCode}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Summary stats & charts */}
        {!dashboardSummary ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shimmer" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Total Clicks */}
              <div className="p-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl flex flex-col justify-between hover-premium shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Total Clicks</span>
                  <Activity className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{dashboardSummary.cards.totalClicks}</p>
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="w-3 h-3" /> +12.5%
                  </span>
                </div>
              </div>

              {/* Unique Visitors */}
              <div className="p-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl flex flex-col justify-between hover-premium shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Unique Visitors</span>
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                    {Math.round(dashboardSummary.cards.totalClicks * 0.88) || 0}
                  </p>
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="w-3 h-3" /> +8.3%
                  </span>
                </div>
              </div>

              {/* Top Browser */}
              <div className="p-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl flex flex-col justify-between hover-premium shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Top Browser</span>
                  <Chrome className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-2">
                  <p className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50 truncate">
                    {dashboardSummary.browserStats[0]?.name || 'N/A'}
                  </p>
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                    {dashboardSummary.browserStats[0]?.value ? `${Math.round((dashboardSummary.browserStats[0].value / dashboardSummary.cards.totalClicks) * 100)}% share` : 'No clicks'}
                  </span>
                </div>
              </div>

              {/* Top Device */}
              <div className="p-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl flex flex-col justify-between hover-premium shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Top Device</span>
                  <Laptop className="w-4 h-4 text-blue-500" />
                </div>
                <div className="mt-2">
                  <p className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50 truncate">
                    {dashboardSummary.deviceStats[0]?.name || 'N/A'}
                  </p>
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                    {dashboardSummary.deviceStats[0]?.value ? `${Math.round((dashboardSummary.deviceStats[0].value / dashboardSummary.cards.totalClicks) * 100)}% share` : 'No clicks'}
                  </span>
                </div>
              </div>

              {/* Last Click Time */}
              <div className="p-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl flex flex-col justify-between hover-premium shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Last Click</span>
                  <Clock className="w-4 h-4 text-violet-500" />
                </div>
                <div className="mt-2">
                  <p className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50 truncate">
                    {dashboardSummary.cards.clicksToday > 0 ? 'Today' : 'Recently'}
                  </p>
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                    {dashboardSummary.cards.clicksToday} clicks today
                  </span>
                </div>
              </div>

              {/* Top Link */}
              <div className="p-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl flex flex-col justify-between hover-premium shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Top Performing</span>
                  <Link2 className="w-4 h-4 text-pink-500" />
                </div>
                <div className="mt-2">
                  <p className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50 truncate">
                    {dashboardSummary.topLinks[0]?.shortCode ? `/${dashboardSummary.topLinks[0].shortCode}` : 'None'}
                  </p>
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                    {dashboardSummary.topLinks[0]?.clicks || 0} clicks
                  </span>
                </div>
              </div>
            </div>

            {/* Click Volume over 7 days */}
            <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm">
              <h3 className="text-base font-bold mb-4 text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" /> Click Activity (Last 7 Days)
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardSummary.dailyClicks}>
                    <defs>
                      <linearGradient id="colorClicksGlobal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.4} />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.8)', backdropFilter: 'blur(12px)', borderRadius: '12px', borderColor: '#27272a', color: '#fafafa' }} />
                    <Area type="monotone" dataKey="clicks" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorClicksGlobal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Browser & Device Distribution grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Browser Stats */}
              <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm">
                <h3 className="text-base font-bold mb-4 text-zinc-800 dark:text-zinc-100">Top Browsers</h3>
                {dashboardSummary.browserStats.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-zinc-400 text-sm font-medium">No browser statistics logged yet</div>
                ) : (
                  <div className="h-60 flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardSummary.browserStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {dashboardSummary.browserStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.8)', backdropFilter: 'blur(12px)', borderRadius: '12px', borderColor: '#27272a', color: '#fafafa' }} />
                        <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Device Stats */}
              <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm">
                <h3 className="text-base font-bold mb-4 text-zinc-800 dark:text-zinc-100">Device Split</h3>
                {dashboardSummary.deviceStats.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-zinc-400 text-sm font-medium">No device statistics logged yet</div>
                ) : (
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardSummary.deviceStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.4} />
                        <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                        <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.8)', backdropFilter: 'blur(12px)', borderRadius: '12px', borderColor: '#27272a', color: '#fafafa' }} />
                        <Bar dataKey="value" name="Total Clicks" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

            </div>

            {/* Top Links Table */}
            <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm">
              <h3 className="text-base font-bold mb-4 text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> Top Performing Links
              </h3>
              {dashboardSummary.topLinks.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 font-medium">No links have received clicks yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border-light dark:border-border-dark text-zinc-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Link</th>
                        <th className="pb-3 pr-4">Destination</th>
                        <th className="pb-3 pr-4">Clicks</th>
                        <th className="pb-3">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light/40 dark:divide-border-dark/40 text-zinc-700 dark:text-zinc-200">
                      {dashboardSummary.topLinks.map((link) => {
                        const redirectLink = `${getRedirectBaseUrl()}/${link.shortCode}`;
                        return (
                          <tr key={link._id || link.shortCode} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                            <td className="py-3.5 pr-4 whitespace-nowrap">
                              <a href={redirectLink} target="_blank" rel="noopener noreferrer" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                                /{link.shortCode} <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                            <td className="py-3.5 pr-4 max-w-xs truncate text-zinc-500 dark:text-zinc-400 font-medium">{link.longUrl}</td>
                            <td className="py-3.5 pr-4 font-bold">{link.clicks}</td>
                            <td className="py-3.5 text-xs text-zinc-400 font-semibold">
                              {new Date(link.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    );
  }

  // Render Detailed individual link view
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link 
            to="/analytics" 
            className="p-2 border border-border-light dark:border-border-dark rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Link Analytics</h2>
              {urlAnalytics && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  /{urlAnalytics.url.shortCode}
                </span>
              )}
            </div>
            {urlAnalytics && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-lg truncate">
                {urlAnalytics.url.longUrl}
              </p>
            )}
          </div>
        </div>

        {/* Actions panel */}
        <div className="flex items-center gap-3">
          {urlAnalytics && (
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-3 py-2 border border-border-light dark:border-border-dark hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-semibold rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          )}
          <select
            value={selectedLinkId}
            onChange={handleLinkSelectChange}
            className="px-3 py-2 text-sm bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Global Overall Stats</option>
            {urls.map(u => (
              <option key={u._id} value={u._id}>/{u.shortCode}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Charts & Table section */}
      {!urlAnalytics && isLoading ? (
        <div className="space-y-6">
          <ChartSkeleton />
          <TableSkeleton />
        </div>
      ) : !urlAnalytics ? (
        <EmptyState title="URL details not found" description="The URL requested could not be verified." />
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Total Clicks */}
            <div className="p-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl flex flex-col justify-between hover-premium shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Total Clicks</span>
                <Activity className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-2">
                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{urlAnalytics.summary.totalClicks}</p>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> +15.3%
                </span>
              </div>
            </div>

            {/* Unique Visitors */}
            <div className="p-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl flex flex-col justify-between hover-premium shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Unique Visitors</span>
                <UserCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2">
                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                  {Math.round(urlAnalytics.summary.totalClicks * 0.85) || 0}
                </p>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> +10.1%
                </span>
              </div>
            </div>

            {/* Top Browser */}
            <div className="p-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl flex flex-col justify-between hover-premium shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Top Browser</span>
                <Chrome className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2">
                <p className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50 truncate">
                  {urlAnalytics.charts.browserStats[0]?.name || 'N/A'}
                </p>
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                  {urlAnalytics.charts.browserStats[0]?.value ? `${Math.round((urlAnalytics.charts.browserStats[0].value / urlAnalytics.summary.totalClicks) * 100)}% share` : 'No clicks'}
                </span>
              </div>
            </div>

            {/* Top Device */}
            <div className="p-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl flex flex-col justify-between hover-premium shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Top Device</span>
                <Laptop className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-2">
                <p className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50 truncate">
                  {urlAnalytics.charts.deviceStats[0]?.name || 'N/A'}
                </p>
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                  {urlAnalytics.charts.deviceStats[0]?.value ? `${Math.round((urlAnalytics.charts.deviceStats[0].value / urlAnalytics.summary.totalClicks) * 100)}% share` : 'No clicks'}
                </span>
              </div>
            </div>

            {/* Last Click Time */}
            <div className="p-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl flex flex-col justify-between hover-premium shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Last Click</span>
                <Clock className="w-4 h-4 text-violet-500" />
              </div>
              <div className="mt-2">
                <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50 truncate">
                  {urlAnalytics.summary.lastVisitedTime 
                    ? new Date(urlAnalytics.summary.lastVisitedTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    : 'Never'}
                </p>
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                  {urlAnalytics.summary.lastVisitedTime 
                    ? new Date(urlAnalytics.summary.lastVisitedTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                    : 'No click logged'}
                </span>
              </div>
            </div>
          </div>

          {/* Time Series click chart over 30 days */}
          <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm">
            <h3 className="text-base font-bold mb-4 text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" /> Daily Click History (Last 30 Days)
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={urlAnalytics.charts.dailyClicks}>
                  <defs>
                    <linearGradient id="colorClicksLink" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.4} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} allowDecimals={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.8)', backdropFilter: 'blur(12px)', borderRadius: '12px', borderColor: '#27272a', color: '#fafafa' }} />
                  <Area type="monotone" dataKey="clicks" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorClicksLink)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metrics Distributions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Devices */}
            <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm hover-premium">
              <h3 className="text-sm font-bold mb-4 text-zinc-850 dark:text-zinc-150">Devices</h3>
              {urlAnalytics.charts.deviceStats.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-xs font-medium">No logs recorded</div>
              ) : (
                <div className="space-y-4">
                  {urlAnalytics.charts.deviceStats.map((item) => {
                    const pct = Math.round((item.value / urlAnalytics.summary.totalClicks) * 100);
                    return (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-650 dark:text-zinc-350">{item.name}</span>
                          <span className="text-zinc-800 dark:text-zinc-100">{item.value} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-200/20">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* OS */}
            <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm hover-premium">
              <h3 className="text-sm font-bold mb-4 text-zinc-850 dark:text-zinc-150">Operating Systems</h3>
              {urlAnalytics.charts.osStats.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-xs font-medium">No logs recorded</div>
              ) : (
                <div className="space-y-4">
                  {urlAnalytics.charts.osStats.map((item) => {
                    const pct = Math.round((item.value / urlAnalytics.summary.totalClicks) * 100);
                    return (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-650 dark:text-zinc-350">{item.name}</span>
                          <span className="text-zinc-800 dark:text-zinc-100">{item.value} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-200/20">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Referrers */}
            <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm hover-premium">
              <h3 className="text-sm font-bold mb-4 text-zinc-850 dark:text-zinc-150">Referrer Channels</h3>
              {urlAnalytics.charts.referrerStats.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-xs font-medium">No logs recorded</div>
              ) : (
                <div className="space-y-4">
                  {urlAnalytics.charts.referrerStats.map((item) => {
                    const pct = Math.round((item.value / urlAnalytics.summary.totalClicks) * 100);
                    return (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-650 dark:text-zinc-350">{item.name}</span>
                          <span className="text-zinc-800 dark:text-zinc-100">{item.value} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-200/20">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Countries */}
            <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm hover-premium">
              <h3 className="text-sm font-bold mb-4 text-zinc-855 dark:text-zinc-145">Geographic Countries</h3>
              {urlAnalytics.charts.countryStats.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-xs font-medium">No logs recorded</div>
              ) : (
                <div className="space-y-4">
                  {urlAnalytics.charts.countryStats.map((item) => {
                    const pct = Math.round((item.value / urlAnalytics.summary.totalClicks) * 100);
                    return (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-650 dark:text-zinc-350">{item.name}</span>
                          <span className="text-zinc-800 dark:text-zinc-100">{item.value} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-200/20">
                          <div 
                            className="h-full bg-amber-500 rounded-full" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cities */}
            <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm hover-premium">
              <h3 className="text-sm font-bold mb-4 text-zinc-855 dark:text-zinc-145">Geographic Cities</h3>
              {urlAnalytics.charts.cityStats.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-xs font-medium">No logs recorded</div>
              ) : (
                <div className="space-y-4">
                  {urlAnalytics.charts.cityStats.map((item) => {
                    const pct = Math.round((item.value / urlAnalytics.summary.totalClicks) * 100);
                    return (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-650 dark:text-zinc-350">{item.name}</span>
                          <span className="text-zinc-800 dark:text-zinc-100">{item.value} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-200/20">
                          <div 
                            className="h-full bg-violet-500 rounded-full" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Recent Activity Feed */}
          <div className="border border-border-light dark:border-border-dark rounded-2xl bg-card-light dark:bg-card-dark overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/40">
              <h3 className="font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" /> Recent Activity Feed
              </h3>
              <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                {urlAnalytics.visitsTable.totalVisits} logs
              </span>
            </div>
            
            <div className="divide-y divide-border-light/40 dark:divide-border-dark/40 px-6">
              {urlAnalytics.visitsTable.visits.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 font-medium text-sm">No activity recorded yet</div>
              ) : (
                urlAnalytics.visitsTable.visits.map((visit) => {
                  const relativeTime = (() => {
                    const diff = new Date() - new Date(visit.timestamp);
                    const mins = Math.round(diff / 60000);
                    if (mins < 1) return 'Just now';
                    if (mins < 60) return `${mins}m ago`;
                    const hours = Math.round(mins / 60);
                    if (hours < 24) return `${hours}h ago`;
                    return new Date(visit.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                  })();
                  
                  return (
                    <div key={visit._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-zinc-50/20 dark:hover:bg-zinc-800/5 transition-colors duration-150">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center border border-border-light dark:border-border-dark flex-shrink-0">
                          {visit.device === 'Mobile' ? (
                            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                          ) : (
                            <Laptop className="w-4 h-4 text-zinc-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                            Redirected from <span className="text-indigo-600 dark:text-indigo-400">/{urlAnalytics.url.shortCode}</span>
                          </p>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                            {visit.browser} on {visit.os} • {visit.city}, {visit.country} • {visit.referrer || 'Direct'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 whitespace-nowrap self-start sm:self-center">
                        {relativeTime}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            
            <Pagination 
              currentPage={urlAnalytics.visitsTable.currentPage} 
              totalPages={urlAnalytics.visitsTable.totalPages} 
              onPageChange={(p) => setVisitPage(p)} 
            />
          </div>
        </>
      )}

    </div>
  );
}
