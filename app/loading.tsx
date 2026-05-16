// app/(main)/loading.tsx
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-transparent">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );
}
