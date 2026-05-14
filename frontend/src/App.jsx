import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster }              from 'react-hot-toast';
import { AuthProvider }         from './context/AuthContext';
import { ThemeProvider }        from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar                   from './components/layout/Navbar';
import Footer                   from './components/layout/Footer';
import ProtectedRoute           from './components/common/ProtectedRoute';
import ScrollToTop              from './components/common/ScrollToTop';
import ErrorBoundary            from './components/common/ErrorBoundary';

// User pages
import Home          from './pages/Home';
import Products      from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import Maintenance   from './pages/Maintenance';
import NotFound      from './pages/NotFound';

// Admin — completely separate layout + pages
import AdminLayout    from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts  from './pages/admin/AdminProducts';
import AdminOrders    from './pages/admin/AdminOrders';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminMaintenance from './pages/admin/AdminMaintenance';
import AdminReturns    from './pages/admin/AdminReturns';
import AdminProfile    from './pages/admin/AdminProfile';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Toaster position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: { fontFamily:"'DM Sans',sans-serif", fontSize:'14px', borderRadius:'12px', boxShadow:'0 8px 32px rgba(0,0,0,0.18)' },
                  success: { iconTheme: { primary:'#26A541', secondary:'#fff' } },
                  error:   { iconTheme: { primary:'#FF4D4D', secondary:'#fff' } },
                }}
              />
              <Layout />
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function Layout() {
  const { pathname } = useLocation();

  // These routes manage their own full-screen layout — no shared Navbar/Footer
  const isAdmin    = pathname.startsWith('/admin');
  const isAuthPage = ['/login', '/register'].includes(pathname);
  const showNav    = !isAdmin && !isAuthPage;

  return (
    <>
      {showNav && <Navbar />}
      <Routes>
        {/* ── Public / User routes ── */}
        <Route path="/"             element={<Home />} />
        <Route path="/products"     element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/register"     element={<Register />} />
        <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/maintenance"  element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />

        {/* ── Admin routes — completely separate layout with sidebar ── */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
          <Route index              element={<AdminDashboard />} />
          <Route path="products"  element={<AdminProducts />} />
          <Route path="orders"    element={<AdminOrders />} />
          <Route path="users"     element={<AdminUsers />} />
          <Route path="maintenance" element={<AdminMaintenance />} />
          <Route path="returns"     element={<AdminReturns />} />
          <Route path="profile"     element={<AdminProfile />} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showNav && <Footer />}
    </>
  );
}
