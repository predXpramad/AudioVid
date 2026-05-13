import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { DownloadCard } from '../components/DownloadCard';
import { ConfirmModal } from '../components/ConfirmModal';
import { downloadVideo } from '../services/api';
import { DownloadCloud, Trash2, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';

export const DownloadsPage = () => {
  const { jobs, removeJob } = useAppStore();
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Only show completed jobs
  const completedJobs = jobs.filter(job => job.status === 'success');

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(jobId => jobId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === completedJobs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(completedJobs.map(j => j.id));
    }
  };

  const handleDownload = async (id) => {
    try {
      const url = await downloadVideo(id);
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");
    } catch (error) {
      toast.error("Failed to start download.");
    }
  };

  const handleDownloadSelected = () => {
    if (selectedIds.length === 0) return toast.error("No videos selected");
    // In a real app, backend would zip selected IDs. Here we might just trigger multiple or call a batch endpoint.
    toast.success(`Preparing ZIP for ${selectedIds.length} videos...`);
  };

  const handleDeleteSelected = () => {
    selectedIds.forEach(id => removeJob(id));
    setSelectedIds([]);
    toast.success("Jobs removed from history.");
    // In a real app, also call backend to clean up files
  };

  if (completedJobs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400 dark:text-zinc-500">
          <DownloadCloud size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-200 mb-2">No Completed Videos</h2>
        <p className="text-slate-500 dark:text-zinc-400 mb-8">Videos will appear here once processing is finished.</p>
      </div>
    );
  }

  const allSelected = selectedIds.length === completedJobs.length && completedJobs.length > 0;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Downloads</h1>
          <p className="text-slate-600 dark:text-zinc-300 mt-2">Get your rendered YouTube MP4 videos here.</p>
        </div>
        
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-700">
            <span className="text-sm font-medium text-slate-600 dark:text-zinc-300 px-2">{selectedIds.length} selected</span>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Delete Selected"
            >
              <Trash2 size={20} />
            </button>
            <button 
              onClick={handleDownloadSelected}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <DownloadCloud size={20} />
              Download ZIP
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-700 overflow-hidden mb-4">
        <div className="px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-700 flex items-center gap-4">
          <button 
            onClick={handleSelectAll}
            className="text-indigo-600 dark:text-indigo-400 flex items-center gap-2 text-sm font-medium"
          >
            {allSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-400 dark:text-zinc-500" />}
            Select All
          </button>
        </div>
        
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-zinc-900/20">
          {completedJobs.map(job => (
            <DownloadCard 
              key={job.id} 
              video={job} 
              isSelected={selectedIds.includes(job.id)}
              onToggleSelect={handleToggleSelect}
              onDownload={handleDownload}
            />
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteSelected}
        title="Delete Rendered Videos?"
        message="This will remove the selected videos from your history. In a production app, this also cleans up the files from the server. This action cannot be undone."
        confirmText="Delete Files"
        isDestructive={true}
      />
    </div>
  );
};
