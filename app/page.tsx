import { Suspense } from 'react';
import MobileOptimizedPage from './components/MobileOptimizedPage';

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <MobileOptimizedPage />
    </Suspense>
  );
}
