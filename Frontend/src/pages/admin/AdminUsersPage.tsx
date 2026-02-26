import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  GET_USERS,
  UPDATE_USER_ROLE,
  DEACTIVATE_USER,
  ACTIVATE_USER,
} from '../../graphql/queries';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  profilePictureUrl: string | null;
  createdAt: string;
  isActive: boolean;
}

const ROLES = ['User', 'DJ', 'Admin'];

const AdminUsersPage = () => {
  const inputClass =
    'w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500';

  const { data, loading, error, refetch } = useQuery(GET_USERS);
  const [updateRole] = useMutation(UPDATE_USER_ROLE);
  const [deactivateUser] = useMutation(DEACTIVATE_USER);
  const [activateUser] = useMutation(ACTIVATE_USER);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const allUsers: User[] = useMemo(() => data?.users ?? [], [data]);

  const filteredUsers = useMemo(() => {
    let result = allUsers;
    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role?.toLowerCase() === roleFilter.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allUsers, search, roleFilter]);

  const stats = useMemo(() => ({
    total: allUsers.length,
    admins: allUsers.filter((u) => u.role?.toLowerCase() === 'admin').length,
    djs: allUsers.filter((u) => u.role?.toLowerCase() === 'dj').length,
    users: allUsers.filter((u) => u.role?.toLowerCase() === 'user').length,
    inactive: allUsers.filter((u) => !u.isActive).length,
  }), [allUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateRole({ variables: { userId, role: newRole } });
      await refetch();
      setFeedback({ type: 'success', text: `Role updated to ${newRole}.` });
    } catch (e) {
      setFeedback({ type: 'error', text: e instanceof Error ? e.message : 'Failed to update role.' });
    }
  };

  const handleToggleActive = async (user: User) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${user.fullName || user.email}?`)) return;
    try {
      if (user.isActive) {
        await deactivateUser({ variables: { userId: user.id } });
      } else {
        await activateUser({ variables: { userId: user.id } });
      }
      await refetch();
      setFeedback({ type: 'success', text: `User ${action}d.` });
    } catch (e) {
      setFeedback({ type: 'error', text: e instanceof Error ? e.message : `Failed to ${action} user.` });
    }
  };

  if (loading) return <div className="text-sm text-gray-400">Loading users...</div>;
  if (error) {
    return (
      <div className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
        Failed to load users: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Access Control</p>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-gray-400">
          View all registered accounts, assign roles, and manage access.
        </p>
      </header>

      {feedback && (
        <div
          className={`rounded px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-200'
              : 'bg-red-500/10 border border-red-500/30 text-red-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Admins', value: stats.admins },
          { label: 'DJs', value: stats.djs },
          { label: 'Users', value: stats.users },
          { label: 'Inactive', value: stats.inactive },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          className={`${inputClass} flex-1`}
          placeholder="Search by name, email, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={`${inputClass} sm:w-40 appearance-none`}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Users table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-400 uppercase tracking-[0.25em] text-[0.65rem]">
              <th className="py-2">User</th>
              <th className="py-2">Role</th>
              <th className="py-2">Joined</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No users match your search.
                </td>
              </tr>
            )}
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t border-white/5">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full border border-white/10 overflow-hidden bg-black/40 flex-shrink-0">
                      {user.profilePictureUrl ? (
                        <img src={user.profilePictureUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs uppercase text-gray-500">
                          {user.fullName?.charAt(0) || user.email?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{user.fullName || '—'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <select
                    className="rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none"
                    value={user.role || 'User'}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 text-gray-400 text-xs">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.6rem] uppercase tracking-wider font-semibold ${
                      user.isActive !== false
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {user.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => handleToggleActive(user)}
                    className={`text-xs uppercase tracking-wide ${
                      user.isActive !== false ? 'text-red-400' : 'text-green-400'
                    }`}
                  >
                    {user.isActive !== false ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
