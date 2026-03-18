import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No data found', message = '', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Icon size={48} strokeWidth={1.5} className="mb-3" />
      <p className="text-base font-medium text-gray-500">{title}</p>
      {message && <p className="text-sm mt-1 text-gray-400">{message}</p>}
    </div>
  );
}
