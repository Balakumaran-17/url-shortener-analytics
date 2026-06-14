import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAnalyticsStore } from '../store/analyticsStore';
import { MousePointerClick, Calendar, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { CardSkeleton } from '../components/Skeleton';

export default function PublicStats() {
  const { shortCode } = useParams();
  const { publicStats, isLoading, error, fetchPublicStatsAction } = useAnalyticsStore();

  useEffect(() => {
    if (shortCode) {
      fetchPublicStatsAction(shortCode).catch(() => {});
    }
  }, [shortCode]);

  const getStatusBadge = (status, expiresAt) => {
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">
          Expired
        </span>
      );
    }
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400">
        Inactive
      </span>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-6 relative overflow-hidden">
      
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
            <span>BK</span>
          </Link>
          <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 mt-2">Public Link Statistics</h2>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-xl space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : error ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Link statistics not found</h3>
              <p className="text-xs text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                This short link does not exist, has expired, or the statistics have been disabled.
              </p>
              <Link to="/login" className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg">
                Return to Login
              </Link>
            </div>
          ) : publicStats ? (
            <>
              {/* Short code pill */}
              <div className="flex justify-between items-center pb-4 border-b border-border-light dark:border-border-dark">
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Link: <span className="text-indigo-600 dark:text-indigo-400">/{shortCode}</span></span>
                {getStatusBadge(publicStats.status, publicStats.expiresAt)}
              </div>

              {/* Stats values */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-border-light dark:border-border-dark rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <MousePointerClick className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Total Clicks</p>
                  <p className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50">{publicStats.clicks}</p>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-border-light dark:border-border-dark rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Created Date</p>
                  <p className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                    {new Date(publicStats.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Link Expiry Status */}
              {publicStats.expiresAt && (
                <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-amber-500/10 text-amber-500 text-xs border border-amber-500/10">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>
                    Expires: {new Date(publicStats.expiresAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              )}

              {/* Secure Notice */}
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  <span className="font-semibold text-zinc-300">Notice:</span> Detailed visitor statistics (browsers, locations, OS types) are private and require authorization credentials to view.
                </p>
              </div>

              {/* Dashboard buttons */}
              <div className="pt-2 border-t border-border-light dark:border-border-dark flex gap-3">
                <Link
                  to="/login"
                  className="flex-1 py-2 text-center bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition-colors"
                >
                  Manage Your Links
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </div>

    </div>
  );
}
