import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const cleanStaffId = staffId.trim().toUpperCase();
    // Menjadikan ID Staff sebagai alamat pengesahan Supabase Auth
    const authEmail = `${cleanStaffId.toLowerCase()}@company.com`;

    if (isSignUp) {
      // 1. Semakan Kod Jabatan (Wajib "ME")
      if (departmentCode.trim().toUpperCase() !== 'ME') {
        alert('Pendaftaran Gagal: Kod Jabatan tidak sah. Hanya "ME" dibenarkan.');
        setLoading(false);
        return;
      }

      // 2. Register ke Supabase Auth (Supaya muncul di tab Authentication -> Users)
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: password,
      });

      if (error) {
        alert('Pendaftaran Gagal: ' + error.message);
      } else if (data.user) {
        // 3. Simpan data tambahan ke jadual profiles
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            full_name: name,
            staff_id: cleanStaffId,
            department: 'ME',
          },
        ]);

        if (profileError) {
          alert('Profil Gagal Dicipta: ' + profileError.message);
        } else {
          alert('Pendaftaran Berjaya! Pengguna kini muncul di Supabase Authentication.');
          setIsSignUp(false);
          setName('');
          setPassword('');
          setDepartmentCode('');
        }
      }
    } else {
      // 4. Log Masuk menggunakan ID Staff
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: password,
      });

      if (error) {
        alert('Log Masuk Gagal: ID Staff atau Kata Laluan Salah.');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#007bff' }}>
        {isSignUp ? 'Pendaftaran Pekerja' : 'Log Masuk Sistem'}
      </h2>

      <form onSubmit={handleAuth}>
        {isSignUp && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Nama Pekerja:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Masukkan nama penuh"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>ID Staff:</label>
          <input
            type="text"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            required
            placeholder="Contoh: ME1024"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Masukkan kata laluan"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        {isSignUp && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Code Department:</label>
            <input
              type="text"
              value={departmentCode}
              onChange={(e) => setDepartmentCode(e.target.value)}
              required
              placeholder='Masukkan "ME"'
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Sila tunggu...' : isSignUp ? 'Daftar' : 'Log Masuk'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setDepartmentCode('');
          }}
          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isSignUp ? 'Sudah ada akaun? Log masuk' : 'Belum ada akaun? Daftar sekarang'}
        </button>
      </div>
    </div>
  );
};

export default Auth;