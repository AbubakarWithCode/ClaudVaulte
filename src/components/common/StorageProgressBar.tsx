import React from 'react';
import { formatBytes } from '../../lib/utils';
import { HardDrive } from 'lucide-react';

interface StorageProgressBarProps {
  usedBytes: number;
  limitBytes: number;
  showLabels?: boolean;
  compact?: boolean;
}

export default function StorageProgressBar({
  usedBytes,
  limitBytes,
  showLabels = true,
  compact = false,
}: StorageProgressBarProps) {
  const percent = Math.min(100, Math.round((usedBytes / (limitBytes || 1)) * 100));
  const remaining = Math.max(0, limitBytes - usedBytes);

  let barColor = 'bg-blue-600';
  if (percent > 90) barColor = 'bg-rose-500';
  else if (percent > 75) barColor = 'bg-amber-500';

  if (compact) {
    return (
      <div className="w-full">
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-500 rounded-full`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {showLabels && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <HardDrive className="w-3.5 h-3.5 text-blue-500" />
            <span>Storage Used</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">
            {percent}% ({formatBytes(usedBytes)} / {formatBytes(limitBytes)})
          </span>
        </div>
      )}

      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full ${barColor} transition-all duration-500 rounded-full`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {showLabels && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {formatBytes(remaining)} remaining of your 5 GB free plan.
        </p>
      )}
    </div>
  );
}
