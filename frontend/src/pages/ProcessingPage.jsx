import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ProgressCard } from '../components/ProgressCard';
import { ConfirmModal } from '../components/ConfirmModal';
import { getJobStatus, cancelJob } from '../services/api';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const ProcessingPage = () => {
  const { jobs, updateJobStatus, removeJob } = useAppStore();
  const navigate = useNavigate();
  const [jobToCancel, setJobToCancel] = useState(null);

  // Polling logic for status updates (Since websocket isn't fully implemented yet)
  useEffect(() => {
    const activeJobs = jobs.filter(j => j.status === 'queued' || j.status === 'processing');
    
    if (activeJobs.length === 0) return;

    const interval = setInterval(async () => {
      for (const job of activeJobs) {
        try {
          const statusData = await getJobStatus(job.id);
          // Assuming backend returns { status, progress, message }
          updateJobStatus(job.id, {
            status: statusData.status,
            progress: statusData.progress || 0,
            message: statusData.message || ''
          });
        } catch (error) {
          console.error(`Failed to fetch status for job ${job.id}`);
        }
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [jobs, updateJobStatus]);

  const handleCancelJob = async () => {
    if (!jobToCancel) return;
    try {
      await cancelJob(jobToCancel);
      removeJob(jobToCancel);
      toast.success("Job cancelled successfully.");
    } catch (error) {
      toast.error("Failed to cancel job.");
    } finally {
      setJobToCancel(null);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400 dark:text-zinc-500">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-200 mb-2">No Active Conversions</h2>
        <p className="text-slate-500 dark:text-zinc-400 mb-8">You haven't started any video conversions yet.</p>
        <button onClick={() => navigate('/upload')} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          Upload Files
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Processing Queue</h1>
          <p className="text-slate-600 dark:text-zinc-300 mt-2">Monitor your audiobook conversion progress in real-time.</p>
        </div>
      </div>

      <div className="space-y-4">
        {jobs.map(job => (
          <ProgressCard 
            key={job.id} 
            job={job} 
            onCancel={(id) => setJobToCancel(id)}
          />
        ))}
      </div>

      <ConfirmModal
        isOpen={!!jobToCancel}
        onClose={() => setJobToCancel(null)}
        onConfirm={handleCancelJob}
        title="Cancel Processing?"
        message="Are you sure you want to cancel this video conversion? Any progress will be lost."
        confirmText="Cancel Job"
        isDestructive={true}
      />
    </div>
  );
};
