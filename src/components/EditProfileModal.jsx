import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function EditProfileModal({ user, profile, onClose, onProfileUpdated }) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [staffId, setStaffId] = useState(profile?.staff_id || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(profile?.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
    setSuccessMessage('');

    try {
      // 1. Validasi Tukar Kata Laluan (jika diisi)
      if (newPassword) {
        if (newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match!');
        }

        const { error: pwdError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (pwdError) throw pwdError;
      }

      // 2. Muat naik gambar ke bucket 'avatars' jika ada fail baharu
      let finalAvatarUrl = profile?.avatar_url || null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        finalAvatarUrl = publicUrlData.publicUrl;
      }

      // 3. Simpan ke jadual profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          staff_id: staffId.trim().toUpperCase(),
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      onProfileUpdated({
        ...profile,
        full_name: fullName.trim(),
        staff_id: staffId.trim().toUpperCase(),
        avatar_url: finalAvatarUrl,
      });

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
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
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '15px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '10px',
        maxWidth: '440px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#0d3b66', fontSize: '18px' }}>👤 Edit Staff Profile</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✕</button>
        </div>

        {errorMessage && (
          <div style={{ padding: '9px 12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '5px', fontSize: '12px', marginBottom: '12px' }}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{ padding: '9px 12px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '5px', fontSize: '12px', marginBottom: '12px' }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Avatar Preview & Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '85px',
              height: '105px',
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
                <span style={{ fontSize: '36px', color: '#94a3b8' }}>👤</span>
              )}
            </div>

            <label style={{
              fontSize: '12px',
              color: '#0d3b66',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}>
              Choose Photo
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Full Name */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '4px' }}>
              Full Name:
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '13px' }}
            />
          </div>

          {/* Staff ID */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '4px' }}>
              Staff ID:
            </label>
            <input
              type="text"
              required
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '13px' }}
            />
          </div>

          {/* Change Password Section */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0d3b66', display: 'block', marginBottom: '8px' }}>
              🔒 Change Password (Optional)
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="password"
                placeholder="New Password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '13px' }}
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              style={{ padding: '8px 16px', borderRadius: '5px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              style={{ padding: '8px 16px', borderRadius: '5px', border: 'none', background: '#0d3b66', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
            >
              {uploading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}