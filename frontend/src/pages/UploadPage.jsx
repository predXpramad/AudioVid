import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUploader } from '../components/FileUploader';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAppStore } from '../store/useAppStore';
import { useConfirmNavigation } from '../hooks/useConfirmNavigation';
import { uploadFiles } from '../services/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export const UploadPage = () => {
  const navigate = useNavigate();
  const { audioFiles, imageFile, addJob } = useAppStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Only confirm if files are selected and we aren't currently uploading
  const isDirty = (audioFiles.length > 0 || imageFile) && !isUploading;
  const { showConfirm, confirmNavigation, cancelNavigation } = useConfirmNavigation(isDirty);

  const handleStartConversion = async () => {
    if (!imageFile) {
      return toast.error("Please provide a thumbnail image.");
    }
    if (audioFiles.length === 0) {
      return toast.error("Please provide at least one audio file.");
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await uploadFiles(audioFiles, imageFile, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      // Add a parent job tracking all files
      addJob({
        id: response.job_id,
        filename: `Batch conversion (${audioFiles.length} files)`,
        size: audioFiles.reduce((acc, f) => acc + f.size, 0),
        status: 'queued',
        progress: 0,
        message: 'Awaiting worker...',
        isBatch: true,
        filesCount: audioFiles.length
      });

      toast.success("Upload complete! Conversion started.");
      navigate('/processing');
      
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Upload Files</h1>
        <p className="text-slate-600 dark:text-zinc-300 mt-2">Select your audiobook chapters and the background thumbnail.</p>
      </div>

      <div className="bg-white dark:bg-zinc-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-700">
        <FileUploader />
        
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500 dark:text-zinc-400">
            {audioFiles.length > 0 ? `${audioFiles.length} file(s) ready` : 'No files selected'}
          </div>
          
          <button
            onClick={handleStartConversion}
            disabled={isUploading || audioFiles.length === 0 || !imageFile}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
              isUploading || audioFiles.length === 0 || !imageFile
                ? 'bg-slate-100 dark:bg-zinc-700 text-slate-400 dark:text-zinc-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Uploading {uploadProgress}%
              </>
            ) : (
              'Start Conversion'
            )}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={cancelNavigation}
        onConfirm={confirmNavigation}
        title="Discard Uploads?"
        message="You have selected files but haven't started the conversion. Are you sure you want to leave? Your selected files will be cleared."
        confirmText="Leave Page"
        isDestructive={true}
      />
    </div>
  );
};
