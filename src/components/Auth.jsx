import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [loading, setLoading] = useState(false);

  // States
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetNotices = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetNotices();

    try {
      // 1. Mod Forgot Password
      if (authMode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        });

        if (error) throw error;

        setSuccessMessage('Password reset link has been sent to your email. Please check your inbox!');
        setLoading(false);
        return;
      }

      // 2. Mod Sign Up
      if (authMode === 'signup') {
        if (departmentCode.trim().toUpperCase() !== 'ME') {
          setErrorMessage('Invalid Department Code!');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: name.trim(),
              staff_id: staffId.trim().toUpperCase(),
              department_code: 'ME',
            },
          },
        });

        if (error) throw error;

        if (data?.user && data?.user?.identities?.length === 0) {
          setErrorMessage('This email is already registered. Please log in.');
        } else {
          setSuccessMessage('Registration successful! Please log in with your credentials.');
          setAuthMode('login');
          setPassword('');
          setStaffId('');
          setDepartmentCode('');
        }
      } else {
        // 3. Mod Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        if (onLoginSuccess && data?.user) {
          onLoginSuccess(data.user);
        }
      }
    } catch (err) {
      console.error('Authentication Error Details:', err);
      const displayMsg = err.error_description || err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      setErrorMessage(displayMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '50px auto',
      padding: '24px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', color: '#0d3b66', marginBottom: '20px' }}>
        {authMode === 'signup' && 'Staff Registration'}
        {authMode === 'login' && 'Staff Login'}
        {authMode === 'forgot' && 'Reset Password'}
      </h2>

      {errorMessage && (
        <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', marginBottom: '15px', fontSize: '13px', wordBreak: 'break-word' }}>
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div style={{ padding: '10px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '4px', marginBottom: '15px', fontSize: '13px' }}>
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Email */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '4px' }}>
            Email:
          </label>
          <input
            type="email"
            required
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '9px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        {/* Full Name (Sign Up Sahaja) */}
        {authMode === 'signup' && (
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '4px' }}>
              Name:
            </label>
            <input
              type="text"
              required
              placeholder="Enter your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
        )}

        {/* Staff ID (Sign Up Sahaja) */}
        {authMode === 'signup' && (
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '4px' }}>
              Staff ID:
            </label>
            <input
              type="text"
              required
              placeholder="Enter your Staff ID"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
        )}

        {/* Password (Login & Sign Up Sahaja) */}
        {authMode !== 'forgot' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
                Password:
              </label>
              {authMode === 'login' && (
                <button
                  type="button"
                  onClick={() => { setAuthMode('forgot'); resetNotices(); }}
                  style={{ background: 'none', border: 'none', color: '#0d3b66', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 38px 9px 9px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontSize: '13px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  color: '#64748b'
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Department Code (Sign Up Sahaja) */}
        {authMode === 'signup' && (
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '4px' }}>
              Department Code:
            </label>
            <input
              type="text"
              required
              placeholder="Enter Department Code"
              value={departmentCode}
              onChange={(e) => setDepartmentCode(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
            <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '3px' }}>
              *Enter the code to verify department registration access.
            </small>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#0d3b66',
            color: '#fff',
            padding: '11px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            marginTop: '8px'
          }}
        >
          {loading ? 'Processing...' : (
            authMode === 'signup' ? 'Register' :
            authMode === 'forgot' ? 'Send Reset Link' : 'Log In'
          )}
        </button>
      </form>

      {/* Navigasi Mod */}
      <div style={{ textAlign: 'center', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {authMode === 'forgot' ? (
          <button
            type="button"
            onClick={() => { setAuthMode('login'); resetNotices(); }}
            style={{ background: 'none', border: 'none', color: '#0d3b66', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
          >
            ← Back to Log In
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'signup' : 'login');
              setShowPassword(false);
              resetNotices();
            }}
            style={{ background: 'none', border: 'none', color: '#0d3b66', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
          >
            {authMode === 'signup' ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </button>
        )}
      </div>
    </div>
  );
}