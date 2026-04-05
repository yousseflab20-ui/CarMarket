import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminLayout } from './components/layout/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Overview from './pages/Overview';
import Users from './pages/Users';
import Cars from './pages/Cars';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import SellerVerifications from './pages/SellerVerifications';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Overview />} />
              <Route path="/cars" element={<Cars />} />
              <Route path="/users" element={<Users />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/verifications" element={<SellerVerifications />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
