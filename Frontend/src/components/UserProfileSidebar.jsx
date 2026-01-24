import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, HelpCircle, X, ChevronDown, Trash2, Trophy } from 'lucide-react';
import { getApiUrl } from '../config/backendConfig';

const UserProfileSidebar = ({ userName = 'User' }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const sidebarRef = useRef(null);

  const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const resolvedUser = currentUser || storedUser;
  const profilePath = resolvedUser?.role === 'mentor' ? '/mentor/profile' : '/student/profile';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      handleLogout();
      return;
    }

    try {
      setDeleteError('');
      setIsDeleting(true);
      const API_URL = getApiUrl().replace(/\/$/, '');

      const res = await fetch(`${API_URL}/user/me`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to delete account');
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsDeleteOpen(false);
      setIsOpen(false);
      navigate('/login');
    } catch (err) {
      setDeleteError(err?.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchMe = async () => {
      try {
        setUserLoading(true);
        const API_URL = getApiUrl().replace(/\/$/, '');
        const res = await fetch(`${API_URL}/user/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          signal: controller.signal
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;

        if (data?.user) {
          setCurrentUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (_) {
        // ignore
      } finally {
        setUserLoading(false);
      }
    };

    void fetchMe();

    return () => controller.abort();
  }, [isOpen]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const menuItems = [
    { label: 'Profile', icon: User, action: () => { setIsOpen(false); navigate(profilePath); }, color: 'text-white' },
    { label: 'Achievements', icon: Trophy, action: () => { setIsOpen(false); navigate('/achievements'); }, color: 'text-yellow-400' },
    { label: 'Help', icon: HelpCircle, action: () => { setIsOpen(false); navigate('/help'); }, color: 'text-white' },
  ];

  return (
    <>
      {/* User Profile Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg border border-white/20 hover:bg-gray-700/50 hover:border-white/30 transition-colors flex items-center gap-1"
        title="Profile Menu"
      >
        <User size={18} className="text-white" />
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isDeleteOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-[60] transition-opacity"
          onClick={() => {
            if (!isDeleting) {
              setIsDeleteOpen(false);
              setDeleteConfirmText('');
              setDeleteError('');
            }
          }}
        />
      )}

      {/* Slide-in Sidebar from Right */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-screen w-80 bg-[#121212] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-700 ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">{userLoading ? 'Loading...' : (resolvedUser?.name || 'User')}</p>
            <p className="text-xs text-gray-400">{resolvedUser?.email || 'email@example.com'}</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-6 py-3">
          <span className="inline-block px-3 py-1 bg-gray-800/60 text-gray-200 text-xs font-medium rounded-full capitalize border border-gray-700/60">
            {resolvedUser?.role || 'user'}
          </span>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full text-left px-6 py-3 flex items-center gap-3 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
              >
                <Icon size={18} className={item.color} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700"></div>

        <button
          onClick={() => {
            setIsDeleteOpen(true);
            setDeleteConfirmText('');
            setDeleteError('');
          }}
          className="w-full text-left px-6 py-3 flex items-center gap-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors font-medium"
        >
          <Trash2 size={18} />
          Delete Account
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full text-left px-6 py-3 flex items-center gap-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors font-medium"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {isDeleteOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-700 bg-[#121212] shadow-2xl">
            <div className="px-5 py-4 border-b border-gray-700 flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold text-base">Delete account</h3>
                <p className="text-gray-400 text-sm mt-1">This action is permanent.</p>
              </div>
              <button
                onClick={() => {
                  if (!isDeleting) {
                    setIsDeleteOpen(false);
                    setDeleteConfirmText('');
                    setDeleteError('');
                  }
                }}
                className="p-1 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-4">
              <p className="text-gray-300 text-sm">Type <span className="text-white font-semibold">DELETE</span> to confirm.</p>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                disabled={isDeleting}
                className="mt-3 w-full px-3 py-2 border border-gray-600 rounded-md bg-[#202327] text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="DELETE"
              />
              {deleteError && <p className="text-sm text-red-400 mt-2">{deleteError}</p>}
            </div>

            <div className="px-5 py-4 border-t border-gray-700 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeleteConfirmText('');
                  setDeleteError('');
                }}
                disabled={isDeleting}
                className="flex-1 border border-gray-600 text-gray-200 hover:bg-gray-700/50 font-semibold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfileSidebar;
