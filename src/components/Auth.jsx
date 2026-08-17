import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  // States
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (isSignUp) {
        // Semakan kata laluan Department Code (Wajib 'ME')
        if (departmentCode.trim().toUpperCase() !== 'ME') {
          setErrorMessage('Department Code tidak sah! Kata laluan department code mestilah ME.');
          setLoading(false);
          return;
        }

        // Pendaftaran Pengguna Baru
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
          setErrorMessage('E-mel ini sudah pun didaftarkan. Sila log masuk.');
        } else {
          setSuccessMessage('Pendaftaran berjaya! Sila log masuk dengan akaun anda.');
          setIsSignUp(false);
          setPassword('');
          setStaffId('');
          setDepartmentCode('');
        }
      } else {
        // Log Masuk
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
        {isSignUp ? 'Staff Registration' : 'Staff Login'}
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
        
        {/* 1. Company Email */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '4px' }}>
            Company Email:
          </label>
          <input
            type="email"
            required
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '9px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        {/* 2. Full Name (Hanya untuk Registration) */}
        {isSignUp && (
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '4px' }}>
              Full Name:
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: MUHAMMAD RAZIN BIN MOHD FAIRUL"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
        )}

        {/* 3. Staff ID (Hanya untuk Registration) */}
        {isSignUp && (
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '4px' }}>
              Staff ID:
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: ME10234"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
        )}

        {/* 4. Password */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '4px' }}>
            Password:
          </label>
          <input
            type="password"
            required
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '9px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        {/* 5. Department Code Password (Bawah Sekali) */}
        {isSignUp && (
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '4px' }}>
              Department Code Password:
            </label>
            <input
              type="text"
              required
              placeholder="Enter Department Password (ME)"
              value={departmentCode}
              onChange={(e) => setDepartmentCode(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
            <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '3px' }}>
              *Masukkan kod ME untuk pengesahan akses pendaftaran.
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
          {loading ? 'Processing...' : (isSignUp ? 'Register' : 'Log In')}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setErrorMessage('');
            setSuccessMessage('');
          }}
          style={{ background: 'none', border: 'none', color: '#0d3b66', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
        >
          {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}