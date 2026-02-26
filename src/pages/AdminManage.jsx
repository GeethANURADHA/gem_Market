import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserMinus, Check, X, Clock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/authContext';
import '../styles/AdminManage.css';

const AdminManage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [pendingRequests, setPendingRequests] = useState(/** @type {any[]} */ ([]));
  const [currentAdmins, setCurrentAdmins] = useState(/** @type {any[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState(/** @type {{[key: string]: string}} */ ({}));
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [reqRes, adminRes] = await Promise.all([
      supabase.from('admin_registrations').select('*').eq('status', 'pending').order('requested_at', { ascending: false }),
      supabase.from('admin_roles').select('*').order('created_at', { ascending: false }),
    ]);
    setPendingRequests(reqRes.data ?? []);
    setCurrentAdmins(adminRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) { navigate('/login'); return; }
    loadData();
  }, [isAdmin, navigate]);

  /**
   * Approve a registration: create Supabase auth user + add to admin_roles
   * @param {any} req
   */
  const handleApprove = async (req) => {
    setActionStatus((s) => ({ ...s, [req.id]: 'loading' }));

    // 1. Create the Supabase Auth user with a temporary password
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
    const { data: userData, error: createErr } = await supabase.auth.admin.createUser({
      email: req.email,
      password: tempPassword,
      email_confirm: true,
    });

    if (createErr) {
      setActionStatus((s) => ({ ...s, [req.id]: `Error: ${createErr.message}` }));
      return;
    }

    // 2. Add to admin_roles
    const { error: roleErr } = await supabase.from('admin_roles').insert([{
      user_id: userData.user.id,
      email: req.email,
      granted_by: user?.id,
    }]);

    if (roleErr) {
      setActionStatus((s) => ({ ...s, [req.id]: `Role error: ${roleErr.message}` }));
      return;
    }

    // 3. Send password reset so they can set their own password
    await supabase.auth.resetPasswordForEmail(req.email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    // 4. Mark request as approved
    await supabase.from('admin_registrations').update({ status: 'approved' }).eq('id', req.id);

    setActionStatus((s) => ({ ...s, [req.id]: 'approved' }));
    await loadData();
  };

  /**
   * Reject a registration request
   * @param {string} reqId
   */
  const handleReject = async (reqId) => {
    setActionStatus((s) => ({ ...s, [reqId]: 'loading' }));
    await supabase.from('admin_registrations').update({ status: 'rejected' }).eq('id', reqId);
    setActionStatus((s) => ({ ...s, [reqId]: 'rejected' }));
    await loadData();
  };

  /**
   * Directly add an admin by email (whitelist)
   * @param {React.FormEvent} e
   */
  const handleDirectAdd = async (e) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    
    setIsAdding(true);
    // Check if already exists
    const { data: existing } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('email', newAdminEmail)
      .maybeSingle();

    if (existing) {
      alert('This email is already an admin.');
      setIsAdding(false);
      return;
    }

    const { error } = await supabase.from('admin_roles').insert([{
      email: newAdminEmail,
      granted_by: user?.id,
    }]);

    if (error) {
      alert(`Error adding admin: ${error.message}`);
    } else {
      setNewAdminEmail('');
      await loadData();
    }
    setIsAdding(false);
  };

  /**
   * Revoke an admin's role
   * @param {string} roleId
   * @param {string} email
   */
  const handleRevoke = async (roleId, email) => {
    if (email === user?.email) {
      alert("You cannot revoke your own admin access!");
      return;
    }
    if (!window.confirm(`Remove admin access for ${email}?`)) return;
    await supabase.from('admin_roles').delete().eq('id', roleId);
    await loadData();
  };

  if (loading) {
    return (
      <div className="manage-container">
        <div className="manage-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="manage-container">
      <div className="manage-header">
        <h1>Manage Admins</h1>
        <p className="manage-subtitle">Approve access requests and manage existing admins</p>
      </div>

      {/* Direct Add Form */}
      <section className="manage-section">
        <h2 className="section-title">
          <UserPlus size={20} />
          Directly Appoint Admin
        </h2>
        <form onSubmit={handleDirectAdd} className="quick-add-form">
          <input
            type="email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            placeholder="admin@example.com"
            className="quick-add-input"
            required
          />
          <button type="submit" className="action-btn approve-btn" disabled={isAdding}>
            {isAdding ? 'Adding...' : 'Add Admin'}
          </button>
        </form>
      </section>

      {/* Pending Requests */}
      <section className="manage-section">
        <h2 className="section-title">
          <Clock size={20} />
          Pending Requests
          {pendingRequests.length > 0 && (
            <span className="badge">{pendingRequests.length}</span>
          )}
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="empty-state">No pending requests.</div>
        ) : (
          <div className="manage-cards">
            {pendingRequests.map((req) => (
              <div key={req.id} className="manage-card">
                <div className="manage-card-info">
                  <div className="manage-card-name">{req.full_name || 'Unknown'}</div>
                  <div className="manage-card-email">{req.email}</div>
                  {req.reason && (
                    <div className="manage-card-reason">"{req.reason}"</div>
                  )}
                  <div className="manage-card-date">
                    Requested: {new Date(req.requested_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="manage-card-actions">
                  {actionStatus[req.id] === 'loading' ? (
                    <span className="action-status">Processing...</span>
                  ) : actionStatus[req.id]?.startsWith('Error') ? (
                    <span className="action-status error">{actionStatus[req.id]}</span>
                  ) : (
                    <>
                      <button
                        className="action-btn approve-btn"
                        onClick={() => handleApprove(req)}
                        title="Approve & send password setup email"
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button
                        className="action-btn reject-btn"
                        onClick={() => handleReject(req.id)}
                        title="Reject request"
                      >
                        <X size={16} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Current Admins */}
      <section className="manage-section">
        <h2 className="section-title">
          <UserPlus size={20} />
          Current Admins
        </h2>
        <div className="manage-cards">
          {currentAdmins.map((admin) => (
            <div key={admin.id} className={`manage-card ${admin.email === user?.email ? 'self-card' : ''}`}>
              <div className="manage-card-info">
                <div className="manage-card-email">{admin.email}</div>
                {admin.email === user?.email && (
                  <span className="you-badge">You</span>
                )}
                <div className="manage-card-date">
                  Granted: {new Date(admin.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="manage-card-actions">
                {admin.email !== user?.email && (
                  <button
                    className="action-btn reject-btn"
                    onClick={() => handleRevoke(admin.id, admin.email)}
                    title="Revoke admin access"
                  >
                    <UserMinus size={16} /> Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminManage;
