import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminLayout } from './components/layout/AdminLayout';
import Overview from './pages/Overview';
import Users from './pages/Users';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/cars" element={<div className="p-8"><h1 className="text-2xl font-bold">Cars Management</h1><p className="mt-4 text-slate-500 italic">Coming soon: Cars list and approval system...</p></div>} />
            <Route path="/users" element={<Users />} />
            <Route path="/messages" element={<div className="p-8"><h1 className="text-2xl font-bold">Messages</h1><p className="mt-4 text-slate-500 italic">Coming soon: Support and buyer/seller chat logs...</p></div>} />
            <Route path="/settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings</h1><p className="mt-4 text-slate-500 italic">Coming soon: System configuration...</p></div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
