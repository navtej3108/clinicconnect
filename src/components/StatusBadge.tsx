const statusConfig = {
  pending: { label: 'Pending', classes: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  confirmed: { label: 'Confirmed', classes: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  completed: { label: 'Completed', classes: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelled', classes: 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  rejected: { label: 'Rejected', classes: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  approved: { label: 'Approved', classes: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? { label: status, classes: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
}
