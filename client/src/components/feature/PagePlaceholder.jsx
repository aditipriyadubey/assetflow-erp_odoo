function PagePlaceholder({ title, description }) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold text-neutral-900">{title}</h2>
      {description && (
        <p className="text-sm text-neutral-500">{description}</p>
      )}
    </div>
  );
}

export default PagePlaceholder;
