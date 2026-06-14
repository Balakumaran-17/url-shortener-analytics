import React, { useEffect, useState } from 'react';
import useAdminStore from '../store/adminStore';
import Pagination from '../components/Pagination';
import { Skeleton } from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';
import { toast } from 'react-hot-toast';
import { Trash2, Users, Link as LinkIcon, BarChart3, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const {
    stats,
    users,
    urls,
    totalUsers,
    totalUrls,
    usersPage,
    urlsPage,
    usersTotalPages,
    urlsTotalPages,
    isLoading,
    fetchStatsAction,
    fetchUsersAction,
    fetchUrlsAction,
    deleteUrlAction
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState(null);

  useEffect(() => {
    fetchStatsAction().catch(() => {});
    fetchUsersAction(usersPage).catch(() => {});
    fetchUrlsAction(urlsPage).catch(() => {});
  }, [usersPage, urlsPage]);

  const handleDeleteClick = (url) => {
    setUrlToDelete(url);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUrl = async () => {
    if (!urlToDelete) return;
    try {
      await deleteUrlAction(urlToDelete._id);
      toast.success('URL successfully deleted by Admin');
    } catch (error) {
      toast.error('Failed to delete URL');
    } finally {
      setIsDeleteModalOpen(false);
      setUrlToDelete(null);
    }
  };

  const renderStats = () => {
    if (!stats && isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase">Total Users</p>
            <p className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats?.totalUsers || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase">Total URLs</p>
            <p className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats?.totalUrls || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <LinkIcon className="w-5 h-5" />
          </div>
        </div>
        <div className="p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase">Total Visits</p>
            <p className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats?.totalVisits || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  };

  const renderUsersTable = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Registered Users</h3>
      <div className="overflow-hidden border border-border-light dark:border-border-dark rounded-xl bg-card-light dark:bg-card-dark">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-xs font-semibold uppercase text-zinc-500">
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{user.username}</td>
                  <td className="px-6 py-4 text-zinc-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={usersPage} totalPages={usersTotalPages} onPageChange={(p) => fetchUsersAction(p)} />
      </div>
    </div>
  );

  const renderUrlsTable = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">All Platform URLs</h3>
      <div className="overflow-hidden border border-border-light dark:border-border-dark rounded-xl bg-card-light dark:bg-card-dark">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-xs font-semibold uppercase text-zinc-500">
                <th className="px-6 py-4">Short Code</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Clicks</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
              {urls.map((url) => (
                <tr key={url._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                  <td className="px-6 py-4 font-medium text-indigo-600 dark:text-indigo-400">/{url.shortCode}</td>
                  <td className="px-6 py-4 text-zinc-500 max-w-xs truncate" title={url.longUrl}>{url.longUrl}</td>
                  <td className="px-6 py-4 text-zinc-500">
                    {url.userId ? url.userId.username : 'Deleted User'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-zinc-700 dark:text-zinc-300">{url.clicks}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteClick(url)}
                      className="p-1.5 border border-red-500/20 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                      title="Delete URL"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={urlsPage} totalPages={urlsTotalPages} onPageChange={(p) => fetchUrlsAction(p)} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Admin Dashboard</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Platform overview and moderation tools.</p>
      </div>

      <div className="flex border-b border-border-light dark:border-border-dark space-x-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          Overview & Users
        </button>
        <button
          onClick={() => setActiveTab('urls')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'urls' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          URL Management
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {renderStats()}
          {renderUsersTable()}
        </div>
      )}

      {activeTab === 'urls' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {renderUrlsTable()}
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteUrl}
        title="Admin Delete URL"
        message={`Are you sure you want to permanently delete the URL /${urlToDelete?.shortCode}? This action cannot be undone.`}
      />
    </div>
  );
}
