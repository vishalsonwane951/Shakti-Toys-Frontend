import { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { ProtectedRoute, AdminRoute, OwnerRoute, SuperAdminRoute } from './components/common/ProtectedRoute';
import { ShopProvider } from './context/ShopContext';
import { useShop } from './context/shop-context';
import { CartProvider } from './context/CartContext';

// ── Platform-level pages ──
const LandingPage        = lazy(() => import('./pages/LandingPage'));
const ShopRegisterPage   = lazy(() => import('./pages/ShopRegisterPage'));
const StoreNotFoundPage  = lazy(() => import('./pages/StoreNotFoundPage'));

// ── Storefront pages (lazy-loaded, one chunk each) ──
const HomePage           = lazy(() => import('./pages/HomePage'));
const ProductsPage       = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage  = lazy(() => import('./pages/ProductDetailPage'));
const CartPage           = lazy(() => import('./pages/CartPage'));
const CheckoutPage       = lazy(() => import('./pages/CheckoutPage'));
const LoginPage          = lazy(() => import('./pages/LoginPage'));
const RegisterPage       = lazy(() => import('./pages/RegisterPage'));
const StaffRegisterPage  = lazy(() => import('./pages/StaffRegisterPage'));
const PendingApprovalPage = lazy(() => import('./pages/PendingApprovalPage'));
const DashboardPage      = lazy(() => import('./pages/DashboardPage'));
const OrderDetailPage    = lazy(() => import('./pages/OrderDetailPage'));

// ── Shop admin pages — separate chunk, only loaded when needed ──
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOverview     = lazy(() => import('./pages/admin/AdminOverview'));
const AdminPOS          = lazy(() => import('./pages/admin/AdminPOS'));
const AdminProducts     = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCategories   = lazy(() => import('./pages/admin/AdminCategories'));
const AdminOrders       = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCustomers    = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminStaff        = lazy(() => import('./pages/admin/AdminStaff'));
const AdminSubscription = lazy(() => import('./pages/admin/AdminSubscription'));
const AdminSettings     = lazy(() => import('./pages/admin/AdminSettings'));

// ── Superadmin (platform) pages ──
const SuperAdminLogin     = lazy(() => import('./pages/superadmin/SuperAdminLogin'));
const SuperAdminLayout    = lazy(() => import('./pages/superadmin/SuperAdminLayout'));
const SuperAdminOverview  = lazy(() => import('./pages/superadmin/SuperAdminOverview'));
const SuperAdminShops     = lazy(() => import('./pages/superadmin/SuperAdminShops'));
const SuperAdminPlans     = lazy(() => import('./pages/superadmin/SuperAdminPlans'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

// Resolves :shopSlug into shop branding for everything nested under it.
// Renders a 404-style page if the slug doesn't match an approved shop.
function ShopScope() {
  return (
    <ShopProvider>
      <ShopScopeInner />
    </ShopProvider>
  );
}

function ShopScopeInner() {
  const { loading, notFound } = useShop();
  if (loading) return <PageLoader />;
  if (notFound) return <StoreNotFoundPage />;
  return (
    <CartProvider>
      <Outlet />
    </CartProvider>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Platform-level ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/start-a-store" element={<ShopRegisterPage />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/superadmin" element={<SuperAdminRoute><SuperAdminLayout /></SuperAdminRoute>}>
          <Route index element={<SuperAdminOverview />} />
          <Route path="shops" element={<SuperAdminShops />} />
          <Route path="plans" element={<SuperAdminPlans />} />
        </Route>

        {/* ── Everything below is scoped to one shop by its slug ── */}
        <Route path="/:shopSlug" element={<ShopScope />}>
          {/* Storefront */}
          <Route index element={<MainLayout><HomePage /></MainLayout>} />
          <Route path="products" element={<MainLayout><ProductsPage /></MainLayout>} />
          <Route path="product/:id" element={<MainLayout><ProductDetailPage /></MainLayout>} />
          <Route path="cart" element={<MainLayout><CartPage /></MainLayout>} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="staff-signup" element={<StaffRegisterPage />} />
          <Route path="pending-approval" element={<PendingApprovalPage />} />

          {/* Protected — any logged-in user of this shop */}
          <Route path="checkout" element={<ProtectedRoute><MainLayout><CheckoutPage /></MainLayout></ProtectedRoute>} />
          <Route path="dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
          <Route path="order/:id" element={<ProtectedRoute><MainLayout><OrderDetailPage /></MainLayout></ProtectedRoute>} />

          {/* Shop admin panel — owner/staff only */}
          <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
            <Route index element={<AdminOverview />} />
            <Route path="pos" element={<AdminPOS />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="staff" element={<OwnerRoute><AdminStaff /></OwnerRoute>} />
            <Route path="subscription" element={<OwnerRoute><AdminSubscription /></OwnerRoute>} />
            <Route path="settings" element={<OwnerRoute><AdminSettings /></OwnerRoute>} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
