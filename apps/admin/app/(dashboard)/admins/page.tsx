'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminFetch';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentRole, setCurrentRole] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'admin',
  });

  useEffect(() => {
    fetchMe();
    fetchAdmins();
  }, []);

  const fetchMe = async () => {
    try {
      const res = await adminFetch('/api/admins/me');
      const raw = await res.json();
      const data = raw.data ?? raw;
      setCurrentRole(data.role ?? '');
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admins/list');
      const raw = await res.json();
      const data = raw.data ?? raw;
      setAdmins(data.admins ?? data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminFetch('/api/admins/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (res.ok) {
        alert('Admin created successfully!');
        setShowAddModal(false);
        setForm({ email: '', password: '', name: '', role: 'admin' });
        fetchAdmins();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create admin');
      }
    } catch (e) {
      alert('Failed to create admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await adminFetch(`/api/admins/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchAdmins();
    } catch (e) {
      alert('Failed to toggle admin');
    }
  };

  const isSuperAdmin = currentRole === 'super_admin';

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1A1F1E', marginBottom: '4px' }}>Admins</h1>
          <p style={{ fontSize: '14px', color: '#6B7370' }}>Manage admin accounts and permissions</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: '#1A6B5A',
              color: '#FFFFFF',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            + Add Admin
          </button>
        )}
      </div>

      {!isSuperAdmin && (
        <div style={{
          backgroundColor: '#FFF9E6',
          border: '1px solid #FFE58F',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#8B6F00',
        }}>
          Only super admins can manage other admins.
        </div>
      )}

      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        border: '1px solid #F0EDE8',
      }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6B7370' }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#FAF8F4', borderBottom: '1px solid #F0EDE8' }}>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Last Login</th>
                {isSuperAdmin && <th style={thStyle}></th>}
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin.id} style={{ borderBottom: '1px solid #F0EDE8' }}>
                  <td style={tdStyle}>{admin.name}</td>
                  <td style={{ ...tdStyle, fontSize: '13px', color: '#6B7370' }}>{admin.email}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: admin.role === 'super_admin' ? '#F3E8FF' : '#DBEAFE',
                      color: admin.role === 'super_admin' ? '#7E22CE' : '#1E40AF',
                    }}>
                      {admin.role}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: admin.is_active ? '#DCFCE7' : '#FEE2E2',
                      color: admin.is_active ? '#16A34A' : '#DC2626',
                    }}>
                      {admin.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontSize: '13px', color: '#6B7370' }}>
                    {admin.last_login_at ? new Date(admin.last_login_at).toLocaleDateString() : 'Never'}
                  </td>
                  {isSuperAdmin && (
                    <td style={tdStyle}>
                      {admin.role !== 'super_admin' && (
                        <button
                          onClick={() => handleToggle(admin.id, admin.is_active)}
                          style={{
                            fontSize: '13px',
                            color: admin.is_active ? '#DC2626' : '#16A34A',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                          }}
                        >
                          {admin.is_active ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '32px',
            width: '100%',
            maxWidth: '450px',
            margin: '0 20px',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1F1E', marginBottom: '20px' }}>Add New Admin</h2>
            <form onSubmit={handleAddAdmin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                  placeholder="Full name"
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={inputStyle}
                  placeholder="admin@example.com"
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={inputStyle}
                  placeholder="Min 8 characters"
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  style={inputStyle}
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #E8E2D9',
                    backgroundColor: '#FFFFFF',
                    color: '#1A1F1E',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#1A6B5A',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 20px',
  fontSize: '11px',
  fontWeight: '700',
  color: '#6B7370',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tdStyle: React.CSSProperties = {
  padding: '16px 20px',
  fontSize: '14px',
  color: '#1A1F1E',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#1A1F1E',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #E8E2D9',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1A1F1E',
  backgroundColor: '#FFFFFF',
  outline: 'none',
};
