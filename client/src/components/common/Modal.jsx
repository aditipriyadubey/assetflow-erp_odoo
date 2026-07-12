import { useCallback, useEffect, useId } from 'react';
import { X } from 'lucide-react';

function Modal({ isOpen, onClose, title, children, footer }) {
  const titleId = useId();
  const handleEscape = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <button
        type="button"
        className="absolute inset-0 bg-neutral-900/50"
        aria-label="Close modal"
        onClick={onClose}
      />

      <div
        className="relative z-10 w-full max-w-lg rounded-lg border border-neutral-200 bg-white shadow-lg"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          {title && (
            <h2 id={titleId} className="text-lg font-semibold text-neutral-900">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-4">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-neutral-200 px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
