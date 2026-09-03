import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

export default function EditProfileModal({ user, profile, onClose, onProfileUpdated }) {
  const fileInputRef = useRef(null);

  const initialName = 
    profile?.full_name || 
    user?.user_metadata?.full_name || 
    user?.user_metadata?.name || 
    '';

  const initialStaffId = 
    profile?.staff_id || 
    user?.user_metadata?.staff_id || 
    '';

  const [fullName, setFullName] = useState(initialName);
  const [staffId, setStaffId] = useState(initialStaffId);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(profile?.avatar_url || user?.user_metadata?.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (initialName) setFullName(initialName);
    if (initialStaffId) setStaffId(initialStaffId);
    const existingAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;
    if (existingAvatar) setPreviewUrl(existingAvatar);
  }, [initialName, initialStaffId, profile?.avatar_url, user?.user_metadata?.avatar_url]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 5 MB limit!');
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

      let finalAvatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw new Error('Failed to upload image: ' + uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        finalAvatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
      }

      const updatedFullName = fullName.trim() !== '' ? fullName.trim() : initialName;
      const updatedStaffId = staffId.trim() !== '' ? staffId.trim().toUpperCase() : initialStaffId;

      const profilePayload = {
        full_name: updatedFullName,
        staff_id: updatedStaffId,
        avatar_url: finalAvatarUrl,
        department: profile?.department || 'ME',
        updated_at: new Date().toISOString(),
      };

      let { data: updatedData } = await supabase
        .from('profiles')
        .update(profilePayload)
        .eq('id', user.id)
        .select();

      if (!updatedData || updatedData.length === 0) {
        const { data: staffData, error: staffError } = await supabase
          .from('profiles')
          .update(profilePayload)
          .eq('staff_id', updatedStaffId)
          .select();

        if (staffError) throw staffError;
        updatedData = staffData;
      }

      if (!updatedData || updatedData.length === 0) {
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, ...profilePayload }])
          .select();

        if (insertError) throw insertError;
        updatedData = insertData;
      }

      await supabase.auth.updateUser({
        data: {
          full_name: updatedFullName,
          staff_id: updatedStaffId,
          avatar_url: finalAvatarUrl,
        },
      });

      const finalProfileObject = (updatedData && updatedData[0]) ? updatedData[0] : {
        ...profile,
        full_name: updatedFullName,
        staff_id: updatedStaffId,
        avatar_url: finalAvatarUrl,
      };

      if (onProfileUpdated) {
        onProfileUpdated(finalProfileObject);
      }

      setSuccessMessage('Profile and photo updated successfully!');
      setTimeout(() => {
        onClose();
      }, 900);
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div 
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{
                width: '90px',
                height: '115px',
                borderRadius: '8px',
                border: '2px dashed #0d3b66',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                position: 'relative'
              }}
              title="Click to change photo"
            >
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Avatar Preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <span style={{ fontSize: '36px', color: '#94a3b8' }}>👤</span>
              )}

              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(13, 59, 102, 0.75)',
                color: '#fff',
                fontSize: '10px',
                textAlign: 'center',
                padding: '3px 0'
              }}>
                Change
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{
                border: 'none',
                background: 'none',
                color: '#0d3b66',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {previewUrl ? 'Change Photo' : 'Upload Photo'}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onClick={(e) => { e.target.value = null; }}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '4px' }}>
              Full Name:
            </label>
            <input
              type="text"
              placeholder={initialName || "Enter Full Name"}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '4px' }}>
              Staff ID:
            </label>
            <input
              type="text"
              placeholder={initialStaffId || "Enter Staff ID"}
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              style={{ width: '100%', padding: '9px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '13px' }}
            />
          </div>

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