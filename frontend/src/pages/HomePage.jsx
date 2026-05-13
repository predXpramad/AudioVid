import { useNavigate } from 'react-router-dom';
import { UploadCloud, Zap, Shield, PlaySquare } from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto py-12">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          Convert Audiobooks to <span className="text-indigo-600 dark:text-indigo-400">YouTube Videos</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-zinc-300 max-w-2xl mx-auto mb-8">
          Batch process your MP3 files with a single thumbnail image to generate high-quality MP4 videos ready for YouTube publishing. Fast, reliable, and completely local.
        </p>
        <button 
          onClick={() => navigate('/upload')}
          className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
        >
          <UploadCloud size={24} />
          Start Converting Now
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-16">
        <FeatureCard 
          icon={<Zap className="text-amber-500" size={32} />}
          title="Lightning Fast"
          description="Powered by hardware-accelerated FFmpeg for rapid video generation."
        />
        <FeatureCard 
          icon={<PlaySquare className="text-pink-500" size={32} />}
          title="Batch Processing"
          description="Upload entire audiobook directories at once. We handle the queueing."
        />
        <FeatureCard 
          icon={<Shield className="text-emerald-500" size={32} />}
          title="Reliable Output"
          description="Guaranteed YouTube-compatible formats with optimized bitrates."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-slate-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-14 h-14 bg-slate-50 dark:bg-zinc-700 rounded-xl flex items-center justify-center mb-4 border border-slate-100 dark:border-zinc-600">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
    <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">{description}</p>
  </div>
);
