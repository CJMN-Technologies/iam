'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../frontend/app/App'), {
  ssr: false,
});

export default function Page() {
  return <App />;
}
