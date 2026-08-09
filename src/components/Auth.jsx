import React, { useState } from 'react';
import LandingPage from './LandingPage';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [showLogin, setShowLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [deptCode, setDeptCode] = useState(''); // State untuk Department Code
  const [loading, setLoading] = useState(false);

  const REQUIRED_DEPT_CODE = "ME";
  const DEFAULT_DEPARTMENT = "ME"; // Set terus ke ME

  // Display Landing Page if LOGIN button is not clicked yet
  if (!showLogin) {
    return <LandingPage onGoToLogin={() => setShowLogin(true)} />;
  }

  // Handle Login & Register
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = `${staffId.toLowerCase().trim()}@company.com`;

    if (isRegister) {
      // Semakan Department Code
      if (deptCode.trim() !== REQUIRED_DEPT_CODE) {
        alert('Invalid Department Code! Registration rejected.');
        setLoading(false);
        return;
      }

      // 1. Save user_metadata in options during sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            name: fullName,
            staff_id: staffId.toUpperCase(),
            department: DEFAULT_DEPARTMENT,
          },
        },
      });

      if (error) {
        alert('Registration Failed: ' + error.message);
      } else if (data.user) {
        // 2. Save to profiles table
        try {
          await supabase.from('profiles').upsert([
            {
              id: data.user.id,
              full_name: fullName,
              staff_id: staffId.toUpperCase(),
              department: DEFAULT_DEPARTMENT,
              email: email,
            },
          ]);
        } catch (profileErr) {
          console.warn('Profiles upsert note:', profileErr);
        }

        alert('Registration Successful! Please log in.');
        setIsRegister(false);
        setDeptCode('');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert('Login Failed: ' + error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '30px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <button 
          onClick={() => setShowLogin(false)} 
          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginBottom: '15px', fontWeight: 'bold' }}
        >
          ⬅️ Back to Main
        </button>

        <h2 style={{ textAlign: 'center', color: '#0d3b66', marginBottom: '20px' }}>
          {isRegister ? 'Registration' : 'Login'}
        </h2>

        <form onSubmit={handleAuth}>
          {isRegister && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Full Name:</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Enter your full name"
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Staff ID:</label>
            <input
              type="text"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="Enter your staff ID"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          {isRegister && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Department Code:</label>
              <input
                type="password"
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
                required
                placeholder="Enter Department Code"
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', backgroundColor: '#0d3b66', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            {loading ? 'Please wait...' : isRegister ? 'Register Account' : 'Log In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
          >
            {isRegister ? 'Already have an account? Log In' : "Don't have an account? Register now"}
          </button>
        </div>
      </div>
    </div>
  );
}