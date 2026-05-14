import { useState, useEffect, useContext } from 'react';
import { authAPI } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import PageError from '../../components/common/PageError';

export default function AdminProfile() {
  const { dark } = useTheme();
  const { user: authUser, setUser: setAuthUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'password'

  // Profile info state
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [profileEdit, setProfileEdit] = useState({ name: '', email: '', phone: '' });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load admin profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await authAPI.getAdminProfile();
        const userData = response.data.user;
        setProfile({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
        });
        setProfileEdit({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
        });
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Handle profile info update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      setError(null);
      setSuccess(null);

      const response = await authAPI.updateAdminProfile({
        name: profileEdit.name,
        email: profileEdit.email,
        phone: profileEdit.phone,
      });

      setProfile(profileEdit);
      setEditingProfile(false);
      setSuccess('Profile updated successfully!');
      
      // Update auth context
      if (setAuthUser) {
        setAuthUser({ ...authUser, name: profileEdit.name, email: profileEdit.email });
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      // Validate
      if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
        setError('All password fields are required');
        return;
      }

      if (passwords.newPassword !== passwords.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      if (passwords.newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      setPasswordLoading(true);
      setError(null);
      setSuccess(null);

      await authAPI.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      });

      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-ink-400 dark:text-dm-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !editingProfile && activeTab === 'info') {
    return <PageError message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-head text-2xl font-bold">Admin Profile</h1>
        <p className="text-sm text-ink-400 dark:text-dm-muted mt-1">Manage your admin account</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className={`mb-6 p-4 rounded-lg border ${dark ? 'bg-success/10 border-success/30 text-success' : 'bg-success-light border-success/30 text-success-dark'}`}>
          ✓ {success}
        </div>
      )}
      {error && (
        <div className={`mb-6 p-4 rounded-lg border ${dark ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-100 border-red-300 text-red-700'}`}>
          ✕ {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b" style={{ borderColor: dark ? '#30363D' : '#E5E7EB' }}>
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${
            activeTab === 'info'
              ? 'text-accent border-b-2 border-accent'
              : `text-ink-500 dark:text-dm-muted hover:text-ink-700 dark:hover:text-dm-text`
          }`}
        >
          Profile Information
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${
            activeTab === 'password'
              ? 'text-accent border-b-2 border-accent'
              : `text-ink-500 dark:text-dm-muted hover:text-ink-700 dark:hover:text-dm-text`
          }`}
        >
          Change Password
        </button>
      </div>

      {/* Profile Information Tab */}
      {activeTab === 'info' && (
        <div className={`rounded-2xl border p-6 transition-colors ${dark ? 'bg-dm-card border-dm-border' : 'bg-white border-ink-100'}`}>
          {!editingProfile ? (
            // Display Mode
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-ink-500 dark:text-dm-muted uppercase tracking-wide">Name</p>
                <p className="text-lg font-medium mt-2">{profile.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-500 dark:text-dm-muted uppercase tracking-wide">Email</p>
                <p className="text-lg font-medium mt-2">{profile.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-500 dark:text-dm-muted uppercase tracking-wide">Phone</p>
                <p className="text-lg font-medium mt-2">{profile.phone || '—'}</p>
              </div>
              <button
                onClick={() => setEditingProfile(true)}
                className="mt-4 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition-all duration-200 hover:-translate-y-0.5"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={profileEdit.name}
                  onChange={(e) => setProfileEdit({ ...profileEdit, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                    dark
                      ? 'bg-dm-hover border-dm-border text-dm-text'
                      : 'bg-white border-ink-100 text-ink-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={profileEdit.email}
                  onChange={(e) => setProfileEdit({ ...profileEdit, email: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                    dark
                      ? 'bg-dm-hover border-dm-border text-dm-text'
                      : 'bg-white border-ink-100 text-ink-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={profileEdit.phone}
                  onChange={(e) => setProfileEdit({ ...profileEdit, phone: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                    dark
                      ? 'bg-dm-hover border-dm-border text-dm-text'
                      : 'bg-white border-ink-100 text-ink-900'
                  }`}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProfile(false);
                    setProfileEdit(profile);
                    setError(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    dark
                      ? 'bg-dm-hover text-dm-text hover:bg-dm-border'
                      : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <div className={`rounded-2xl border p-6 transition-colors ${dark ? 'bg-dm-card border-dm-border' : 'bg-white border-ink-100'}`}>
          <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                  dark
                    ? 'bg-dm-hover border-dm-border text-dm-text'
                    : 'bg-white border-ink-100 text-ink-900'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                  dark
                    ? 'bg-dm-hover border-dm-border text-dm-text'
                    : 'bg-white border-ink-100 text-ink-900'
                }`}
                placeholder="At least 6 characters"
                required
              />
              <p className="text-xs text-ink-400 dark:text-dm-muted mt-1">Minimum 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                  dark
                    ? 'bg-dm-hover border-dm-border text-dm-text'
                    : 'bg-white border-ink-100 text-ink-900'
                }`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {passwordLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
