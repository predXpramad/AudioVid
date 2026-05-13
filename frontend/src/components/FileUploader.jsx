import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Music, Image as ImageIcon, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn, formatBytes } from '../utils/helpers';
import toast from 'react-hot-toast';

export const FileUploader = () => {
  const { audioFiles, imageFile, setAudioFiles, setImageFile, removeAudioFile } = useAppStore();

  const onDropAudio = useCallback((acceptedFiles) => {
    // Basic validation, Dropzone also handles accepts but it's good to double check
    const newFiles = acceptedFiles.filter(f => f.type.startsWith('audio/'));
    if (newFiles.length !== acceptedFiles.length) {
      toast.error('Only audio files are allowed in this zone.');
    }
    setAudioFiles([...audioFiles, ...newFiles]);
  }, [audioFiles, setAudioFiles]);

  const onDropImage = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    } else {
      toast.error('Please upload a valid image file.');
    }
  }, [setImageFile]);

  const { getRootProps: getAudioProps, getInputProps: getAudioInputProps, isDragActive: isAudioDrag } = useDropzone({
    onDrop: onDropAudio,
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a'] },
    multiple: true
  });

  const { getRootProps: getImageProps, getInputProps: getImageInputProps, isDragActive: isImageDrag } = useDropzone({
    onDrop: onDropImage,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    multiple: false
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Audio Dropzone */}
        <div 
          {...getAudioProps()} 
          className={cn(
            "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200",
            isAudioDrag ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/30" : "border-slate-300 dark:border-zinc-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          <input {...getAudioInputProps()} />
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
            <Music size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-zinc-200">Drop Audio Files</h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2">MP3, WAV, M4A up to 500MB</p>
        </div>

        {/* Image Dropzone */}
        <div 
          {...getImageProps()} 
          className={cn(
            "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 relative overflow-hidden",
            isImageDrag ? "border-pink-500 bg-pink-50/50 dark:bg-pink-900/30" : "border-slate-300 dark:border-zinc-600 hover:border-pink-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          <input {...getImageInputProps()} />
          {imageFile ? (
            <div className="absolute inset-0 w-full h-full">
              <img src={URL.createObjectURL(imageFile)} alt="Thumbnail" className="w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mb-2 shadow-sm text-pink-600 dark:text-pink-400">
                   <ImageIcon size={24} />
                 </div>
                 <span className="font-medium text-slate-800 dark:text-white bg-white/80 dark:bg-zinc-800/80 px-3 py-1 rounded-full text-sm">Change Image</span>
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center mb-4 text-pink-600 dark:text-pink-400">
                <ImageIcon size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-zinc-200">Drop Thumbnail</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2">JPG, PNG for the video background</p>
            </>
          )}
        </div>
      </div>

      {/* File List */}
      {audioFiles.length > 0 && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 flex justify-between items-center">
            <h4 className="font-medium text-slate-700 dark:text-zinc-200">Selected Audio ({audioFiles.length})</h4>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-zinc-700 max-h-60 overflow-y-auto">
            {audioFiles.map((file) => (
              <li key={file.name} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Music size={16} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                  <span className="text-sm text-slate-700 dark:text-zinc-300 truncate">{file.name}</span>
                  <span className="text-xs text-slate-400 dark:text-zinc-500 shrink-0">{formatBytes(file.size)}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeAudioFile(file.name); }}
                  className="text-slate-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
