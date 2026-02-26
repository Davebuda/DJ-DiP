const AdminUsersPage = () => {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Access Control</p>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-gray-400">
          View all registered accounts, assign roles, and manage access.
        </p>
      </header>

      <div className="card space-y-4 py-12 text-center">
        <p className="text-lg font-semibold text-gray-300">User management coming soon</p>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          The backend API for listing users and managing roles is not yet available.
          Once the <code className="text-orange-400/70">users</code> query and role mutations are added
          to the GraphQL schema, this page will display all accounts with role assignment
          and activation controls.
        </p>
      </div>
    </div>
  );
};

export default AdminUsersPage;
