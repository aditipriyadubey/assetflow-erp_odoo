function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
      {title && (
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      )}
      {description && (
        <p className="mt-2 max-w-sm text-sm text-neutral-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
