import { Loader2 } from 'lucide-react';

export const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-500">
      <Loader2 className="animate-spin mb-4 text-indigo-600" size={32} />
      <p className="font-medium">{message}</p>
    </div>
  );
};
