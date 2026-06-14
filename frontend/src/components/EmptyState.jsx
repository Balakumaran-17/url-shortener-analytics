import React from 'react';
import { Link2 } from 'lucide-react';

export default function EmptyState({ 
  title = 'No items found', 
  description = 'Try creating a new link or checking back later.', 
  icon: Icon = Link2,
  actionButton 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-border-light dark:border-border-dark rounded-xl bg-card-light/20 dark:bg-card-dark/10 backdrop-blur-sm shadow-sm transition-all duration-300">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 mb-5 border border-indigo-500/20 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed font-medium">{description}</p>
      {actionButton && (
        <div className="flex justify-center transition-transform active:scale-[0.98]">
          {actionButton}
        </div>
      )}
    </div>
  );
}
