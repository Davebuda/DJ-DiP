import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ErrorBoundary from './ErrorBoundary';

const Layout = () => (
  <div className="min-h-screen flex flex-col bg-black text-white font-body">
    <Header />
    <main className="flex-1">
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </main>
    <Footer />
  </div>
);

export default Layout;
