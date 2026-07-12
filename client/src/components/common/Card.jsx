function Card({ children, className = '' }) {
  return (
    <div
      className={[
        'rounded-lg border border-neutral-200 bg-white p-4 shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

export default Card;
