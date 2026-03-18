import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Loader2 size={36} className="animate-spin mb-3" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
