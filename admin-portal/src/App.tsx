import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminLayout } from './components/layout/AdminLayout';
import Overview from './pages/Overview';
import Users from './pages/Users';
import Cars from './pages/Cars';
import Messages from './pages/Messages';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/users" element={<Users />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
