import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Spinner() {
  return <div className="min-h-screen flex items-center justify-center bg-dark-900"><div className="w-10 h-10 border-4 border-dark-600 border-t-primary-500 rounded-full animate-spin" /></div>;
}

// Any logged-in user belonging to *this* shop (customer, staff, or owner)
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { shopSlug } = useParams();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to={`/${shopSlug}/login`} state={{ from: location.pathname }} replace />;
  return children;
}

// Owner or staff of *this* shop, and their access must already be approved.
export function AdminRoute({ children }) {
  const { user, loading, isOwnerOrStaff } = useAuth();
  const { shopSlug } = useParams();
  if (loading) return <Spinner />;
  if (!user || !isOwnerOrStaff) return <Navigate to={`/${shopSlug}/login`} replace />;
  // Someone tried to open another shop's admin URL — send them to their own
  if (user.shop?.slug && user.shop.slug !== shopSlug) return <Navigate to={`/${user.shop.slug}/admin`} replace />;
  if (user.status !== 'approved') return <Navigate to={`/${shopSlug}/pending-approval`} replace />;
  return children;
}

// Owner-only sections within the admin panel (staff management, billing, settings)
export function OwnerRoute({ children }) {
  const { user, loading, isOwner } = useAuth();
  const { shopSlug } = useParams();
  if (loading) return <Spinner />;
  if (!user || !isOwner) return <Navigate to={`/${shopSlug}/admin`} replace />;
  return children;
}

export function SuperAdminRoute({ children }) {
  const { user, loading, isSuperadmin } = useAuth();
  if (loading) return <Spinner />;
  if (!user || !isSuperadmin) return <Navigate to="/superadmin/login" replace />;
  return children;
}
