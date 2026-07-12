function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-primary-600">AssetFlow</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Enterprise Asset &amp; Resource Management
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
            )}
          </div>

          {children}
        </div>

        {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
      </div>
    </div>
  );
}

export default AuthLayout;
