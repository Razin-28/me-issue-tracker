import React, { useState } from 'react';
import LandingPage from './LandingPage';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [showLogin, setShowLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('ME');
  const [loading, setLoading] = useState(false);

  // Jika belum klik butang LOGIN di Landing Page, paparkan Landing Page
  if (!showLogin) {
    return <LandingPage onGoToLogin={() => setShowLogin(true)} />;
  }

  // Pengendali Login & Register
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = `${staffId.toLowerCase().trim()}@company.com`;

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert('Gagal Daftar: ' + error.message);
      } else if (data.user) {
        await supabase.from('profiles').insert([
          {
            id: data.user.id,
            full_name: fullName,
            staff_id: staffId.toUpperCase(),
            department: department,
          },
        ]);
        alert('Pendaftaran Berjaya! Sila Log Masuk.');
        setIsRegister(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert('Gagal Log Masuk: ' + error.message);
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
          ⬅️ Kembali ke Utama
        </button>

        <h2 style={{ textAlign: 'center', color: '#0d3b66', marginBottom: '20px' }}>
          {isRegister ? 'Daftar Akaun Pekerja' : 'Log Masuk Pekerja'}
        </h2>

        <form onSubmit={handleAuth}>
          {isRegister && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Nama Penuh:</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>ID Staff:</label>
            <input
              type="text"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="Contoh: 72202523"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Kata Laluan (Password):</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          {isRegister && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Jabatan / Department:</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              >
                <option value="ME">ME (Manufacturing Engineering)</option>
                <option value="QA">QA (Quality Assurance)</option>
                <option value="PE">PE (Process Engineering)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', backgroundColor: '#0d3b66', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            {loading ? 'Sila tunggu...' : isRegister ? 'Daftar Akaun' : 'Log Masuk'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
          >
            {isRegister ? 'Sudah ada akaun? Log Masuk' : 'Belum ada akaun? Daftar sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
}