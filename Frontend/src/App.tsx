import { Route, Routes } from 'react-router-dom';
import Layout from './components/common/Layout';
import LandingPage from './pages/LandingPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import DJsPage from './pages/DJsPage';
import DJProfilePage from './pages/DJProfilePage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardPage from './pages/DashboardPage';
import TicketsPage from './pages/TicketsPage';
import OrdersPage from './pages/OrdersPage';
import UploadMediaPage from './pages/UploadMediaPage';
import GamificationPage from './pages/GamificationPage';
import GalleryPage from './pages/GalleryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import EditDJProfilePage from './pages/EditDJProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminVenuesPage from './pages/admin/AdminVenuesPage';
import AdminDJsPage from './pages/admin/AdminDJsPage';

const App = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route index element={<LandingPage />} />
      <Route path="events" element={<EventsPage />} />
      <Route path="events/:id" element={<EventDetailPage />} />
      <Route path="djs" element={<DJsPage />} />
      <Route path="djs/:id" element={<DJProfilePage />} />
      <Route
        path="djs/edit/:id"
        element={
          <ProtectedRoute>
            <EditDJProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="contact" element={<ContactPage />} />
      <Route path="cart" element={<CartPage />} />
      <Route path="checkout" element={<CheckoutPage />} />
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="tickets"
        element={
          <ProtectedRoute>
            <TicketsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="upload"
        element={
          <ProtectedRoute>
            <UploadMediaPage />
          </ProtectedRoute>
        }
      />
      <Route path="gallery" element={<GalleryPage />} />
      <Route path="gamification" element={<GamificationPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>

    <Route
      path="/admin"
      element={
        <AdminRoute>
          <Layout />
        </AdminRoute>
      }
    >
      <Route index element={<AdminDashboardPage />} />
      <Route path="events" element={<AdminEventsPage />} />
      <Route path="venues" element={<AdminVenuesPage />} />
      <Route path="djs" element={<AdminDJsPage />} />
    </Route>
  </Routes>
);

export default App;
