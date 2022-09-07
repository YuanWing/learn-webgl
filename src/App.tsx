import React from 'react';
import { Routes, Route } from 'react-router-dom';

const Home = React.lazy(() => import('./pages/Learn01'));
const Page02 = React.lazy(() => import('./pages/Learn02'));
const Page03 = React.lazy(() => import('./pages/Learn03'));
const Page04 = React.lazy(() => import('./pages/Learn04'));
const Page05 = React.lazy(() => import('./pages/Learn05'));
const Page06 = React.lazy(() => import('./pages/Learn06'));
const Page07 = React.lazy(() => import('./pages/Learn07'));

function App() {
  return (
    <React.Suspense fallback={<span>Loading...</span>}>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/02' element={<Page02 />} />
        <Route path='/03' element={<Page03 />} />
        <Route path='/04' element={<Page04 />} />
        <Route path='/05' element={<Page05 />} />
        <Route path='/06' element={<Page06 />} />
        <Route path='/07' element={<Page07 />} />
      </Routes>
    </React.Suspense>
  );
}

export default App;
