interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description ? <p className="mt-2 text-sm text-gray-600">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
