import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center space-y-4 text-center px-6">
    <p className="text-sm uppercase tracking-[0.6em] text-orange-400">404</p>
    <h1 className="text-4xl font-bold">Page not found</h1>
    <p className="text-gray-400 max-w-md">
      The route you’re looking for doesn’t exist. Let’s head back to the dance floor.
    </p>
    <Link to="/" className="btn-primary">
      Go Home
    </Link>
  </div>
);

export default NotFoundPage;
