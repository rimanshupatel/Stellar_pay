export function Loader({ size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} border-3 border-gray-200 border-t-gray-900 rounded-full animate-spin`}
      />
    </div>
  );
}

export function Spinner({ className }) {
  return (
    <div className={className}>
      <Loader />
    </div>
  );
}
