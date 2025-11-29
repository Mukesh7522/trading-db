const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-400 text-center">Loading...</p>
    </div>
  </div>
);

export default LoadingSpinner;