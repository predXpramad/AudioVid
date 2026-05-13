import { Download, Film, CheckSquare, Square } from 'lucide-react';
import { formatBytes } from '../utils/helpers';
import { api } from '../services/api'; // Wait, let's just pass down handlers

export const DownloadCard = ({ video, isSelected, onToggleSelect, onDownload }) => {
  return (
    <div 
      className={`bg-white dark:bg-zinc-800 rounded-xl shadow-sm border transition-all p-4 flex items-center gap-4 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 ${
        isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-zinc-700'
      }`}
      onClick={() => onToggleSelect(video.id)}
    >
      <div className="text-indigo-600 dark:text-indigo-400">
        {isSelected ? <CheckSquare size={24} /> : <Square size={24} className="text-slate-300 dark:text-zinc-600" />}
      </div>
      
      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center shrink-0">
        <Film size={24} className="text-indigo-500 dark:text-indigo-400" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-slate-800 dark:text-zinc-200 truncate" title={video.filename}>{video.filename}</h4>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{formatBytes(video.size)} • MP4</p>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDownload(video.id);
        }}
        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
        title="Download Video"
      >
        <Download size={20} />
      </button>
    </div>
  );
};
