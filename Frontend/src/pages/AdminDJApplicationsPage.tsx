import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PENDING_DJ_APPLICATIONS, APPROVE_DJ_APPLICATION, REJECT_DJ_APPLICATION } from '../graphql/queries';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type DJApplication = {
  id: string;
  userId: string;
  stageName: string;
  bio: string;
  genre: string;
  yearsExperience: number;
  specialties?: string;
  influencedBy?: string;
  equipmentUsed?: string;
  socialLinks?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  status: number;
  submittedAt: string;
  userEmail?: string;
  userName?: string;
};

const AdminDJApplicationsPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [selectedApplication, setSelectedApplication] = useState<DJApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_PENDING_DJ_APPLICATIONS);

  const [approveApplication, { loading: approving }] = useMutation(APPROVE_DJ_APPLICATION, {
    onCompleted: () => {
      refetch();
      setSelectedApplication(null);
    },
  });

  const [rejectApplication, { loading: rejecting }] = useMutation(REJECT_DJ_APPLICATION, {
    onCompleted: () => {
      refetch();
      setSelectedApplication(null);
      setShowRejectModal(false);
      setRejectionReason('');
    },
  });

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black">Access Denied</h1>
          <p className="text-gray-400">You must be an admin to view this page</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 text-white font-bold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleApprove = async (applicationId: string) => {
    if (!user?.id) return;
    try {
      await approveApplication({
        variables: {
          applicationId,
          reviewedByAdminId: user.id,
        },
      });
    } catch (err) {
      console.error('Error approving application:', err);
      alert('Failed to approve application');
    }
  };

  const handleReject = async () => {
    if (!selectedApplication || !user?.id) return;
    try {
      await rejectApplication({
        variables: {
          applicationId: selectedApplication.id,
          reviewedByAdminId: user.id,
          rejectionReason: rejectionReason || null,
        },
      });
    } catch (err) {
      console.error('Error rejecting application:', err);
      alert('Failed to reject application');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-red-400 text-lg">Error loading applications</p>
          <p className="text-gray-500 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const applications: DJApplication[] = data?.pendingDjApplications || [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-transparent to-purple-950/20" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-red-500 to-transparent rounded-full" />
            <p className="text-sm uppercase tracking-[0.6em] text-red-400 font-bold">Admin Panel</p>
          </div>
          <h1 className="text-5xl font-black">
            DJ Application <span className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">Review</span>
          </h1>
          <p className="text-gray-400 mt-4">Review and approve DJ applications</p>
        </div>
      </div>

      {/* Applications List */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        {applications.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-6 rounded-full bg-gradient-to-br from-zinc-900 to-black border border-white/10 mb-6">
              <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-400">No Pending Applications</h2>
            <p className="text-gray-600 mt-2">All caught up! Check back later for new DJ applications.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-400">
                <span className="text-2xl font-black text-white">{applications.length}</span> Pending Application{applications.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid gap-6">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="relative group rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black overflow-hidden transition-all duration-300 hover:border-red-500/30"
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/0 via-pink-600/0 to-purple-600/0 group-hover:from-red-600/20 group-hover:via-pink-600/20 group-hover:to-purple-600/20 rounded-3xl blur-xl transition-all duration-500" />

                  <div className="relative p-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Profile Images */}
                      <div className="flex-shrink-0">
                        <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-white/20">
                          {app.profileImageUrl ? (
                            <img src={app.profileImageUrl} alt={app.stageName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-red-950/50 to-purple-950/50 flex items-center justify-center">
                              <span className="text-4xl font-black text-white/30">{app.stageName.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Application Details */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-1 w-8 bg-gradient-to-r from-red-500 to-transparent rounded-full" />
                            <p className="text-xs uppercase tracking-[0.4em] text-gray-600 font-bold">Applicant</p>
                          </div>
                          <h2 className="text-3xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            {app.stageName}
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">
                            {app.userName} ({app.userEmail})
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {app.genre.split(',').map((genre, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-950/50 to-purple-950/50 text-red-300 border border-red-900/30"
                            >
                              {genre.trim()}
                            </span>
                          ))}
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-950/50 to-cyan-950/50 text-blue-300 border border-blue-900/30">
                            {app.yearsExperience} years exp.
                          </span>
                        </div>

                        <p className="text-gray-400 text-sm leading-relaxed">{app.bio}</p>

                        {(app.specialties || app.influencedBy || app.equipmentUsed) && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                            {app.specialties && (
                              <div>
                                <p className="text-xs uppercase tracking-wider text-gray-600 font-bold mb-1">Specialties</p>
                                <p className="text-sm text-gray-400">{app.specialties}</p>
                              </div>
                            )}
                            {app.influencedBy && (
                              <div>
                                <p className="text-xs uppercase tracking-wider text-gray-600 font-bold mb-1">Influenced By</p>
                                <p className="text-sm text-gray-400">{app.influencedBy}</p>
                              </div>
                            )}
                            {app.equipmentUsed && (
                              <div>
                                <p className="text-xs uppercase tracking-wider text-gray-600 font-bold mb-1">Equipment</p>
                                <p className="text-sm text-gray-400">{app.equipmentUsed}</p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-gray-600">Submitted {new Date(app.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-6 pt-6 border-t border-white/5">
                      <button
                        onClick={() => handleApprove(app.id)}
                        disabled={approving}
                        className="flex-1 px-6 py-4 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {approving ? 'Approving...' : '✓ Approve'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApplication(app);
                          setShowRejectModal(true);
                        }}
                        disabled={rejecting}
                        className="flex-1 px-6 py-4 rounded-xl font-bold text-sm tracking-wide bg-white/5 text-white border border-white/10 hover:bg-red-950/50 hover:border-red-900/50 hover:text-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black rounded-3xl border border-white/10 shadow-2xl p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Reject Application
              </h2>
              <p className="text-gray-400 mt-2">
                Rejecting application from <span className="text-white font-semibold">{selectedApplication.stageName}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm uppercase tracking-[0.3em] text-gray-500 mb-2 font-bold">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-gray-600 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
                  placeholder="Please provide feedback for the applicant..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedApplication(null);
                  }}
                  className="flex-1 px-6 py-4 rounded-xl font-bold text-sm tracking-wide bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejecting}
                  className="flex-1 px-6 py-4 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDJApplicationsPage;
