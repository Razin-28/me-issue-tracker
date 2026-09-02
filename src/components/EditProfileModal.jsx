import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function EditProfileModal({ user, profile, onClose, onProfileUpdated }) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [staffId, setStaffId] = useState(profile?.staff_id || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(profile?.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Had saiz 2 MB
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('File size exceeds 2 MB limit!');
      return;
    }

    setErrorMessage('');
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);
    setErrorMessage('');

    try {
      let finalAvatarUrl = profile?.avatar_url || null;

      // 1. Muat naik gambar ke bucket 'avatars' jika ada fail baharu
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        // Dapatkan URL awam
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        finalAvatarUrl = publicUrlData.publicUrl;
      }

      // 2. Simpan rekod ke jadual profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          staff_id: staffId.trim().toUpperCase(),
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      onProfileUpdated({
        ...profile,
        full_name: fullName.trim(),
        staff_id: staffId.trim().toUpperCase(),
        avatar_url: finalAvatarUrl
      });

      onClose();
    } catch (err) {
      console.error('Profile update error:', err);
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '15px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        maxWidth: '420px',
        width: '100%',
        padding: '24px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#0d3b66' }}>Edit Staff Profile</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>

        {errorMessage && (
          <div style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', fontSize: '12px', marginBottom: '12px' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Avatar Preview & Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '90px',
              height: '110px',
              borderRadius: '6px',
              border: '2px dashed #0d3b66',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8fafc'
            }}>
              {previewUrl ? (
                <img src={previewUrl} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '32px', color: '#94a3b8' }}>👤</span>
              )}
            </div>

            <label style={{
              fontSize: '12px',
              color: '#0d3b66',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}>
              Choose Passport Photo (Max 2 MB)
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '4px' }}>
              Full Name:
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '4px' }}>
              Staff ID:
            </label>
            <input
              type="text"
              required
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              style={{ padding: '8px 16px', borderRadius: '5px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              style={{ padding: '8px 16px', borderRadius: '5px', border: 'none', background: '#0d3b66', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {uploading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}