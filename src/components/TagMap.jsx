import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Sesuaikan path supabaseClient anda

export default function TagMap({ onBack }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    requestor: '',
    tag_version: '',
    item_change: '',
  });

  // 1. Ambil data dari Supabase
  const fetchTagMapUpdates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tagmap_updates')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) {
      setUpdates(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTagMapUpdates();
  }, []);

  // 2. Simpan rekod baharu
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.requestor || !formData.tag_version || !formData.item_change) {
      alert('Sila lengkapkan semua ruangan maklumat.');
      return;
    }

    const { error } = await supabase.from('tagmap_updates').insert([formData]);

    if (error) {
      alert('Ralat menyimpan data: ' + error.message);
    } else {
      setShowModal(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        requestor: '',
        tag_version: '',
        item_change: '',
      });
      fetchTagMapUpdates();
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#334155' }}>🚪 Exit</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ➕ Add Update
          </button>
          <button
            onClick={onBack}
            style={{
              backgroundColor: '#ffffff',
              color: '#2563eb',
              border: '1px solid #2563eb',
              padding: '10px 18px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ⬅ Back to Dashboard
          </button>
        </div>
      </div>

      {/* Banner Title */}
      <div
        style={{
          backgroundColor: '#0c4a6e',
          color: '#ffffff',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '22px',
          fontWeight: 'bold',
          marginBottom: '24px',
        }}
      >
        TagMap Updates
      </div>

      {/* Jadual TagMap */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#0c4a6e', color: '#ffffff', fontSize: '14px' }}>
              <th style={{ padding: '14px', width: '60px', textAlign: 'center' }}>No.</th>
              <th style={{ padding: '14px', width: '120px' }}>Date</th>
              <th style={{ padding: '14px', width: '180px' }}>Requestor</th>
              <th style={{ padding: '14px', width: '150px' }}>Tag. Version</th>
              <th style={{ padding: '14px' }}>Item Change</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  Loading updates...
                </td>
              </tr>
            ) : updates.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  No TagMap updates available.
                </td>
              </tr>
            ) : (
              updates.map((item, index) => (
                <tr key={item.id || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#475569' }}>{index + 1}</td>
                  <td style={{ padding: '12px', color: '#334155' }}>{item.date}</td>
                  <td style={{ padding: '12px', color: '#334155', fontWeight: '500' }}>{item.requestor}</td>
                  <td style={{ padding: '12px', color: '#0369a1', fontWeight: 'bold' }}>{item.tag_version}</td>
                  <td style={{ padding: '12px', color: '#334155' }}>{item.item_change}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal / Popup Form */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '10px', width: '450px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0, color: '#0c4a6e', marginBottom: '16px' }}>New TagMap Update</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Requestor</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.requestor}
                  onChange={(e) => setFormData({ ...formData, requestor: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Tag. Version</label>
                <input
                  type="text"
                  placeholder="e.g. v2.4.1"
                  value={formData.tag_version}
                  onChange={(e) => setFormData({ ...formData, tag_version: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Item Change</label>
                <textarea
                  rows="3"
                  placeholder="Describe the changes made..."
                  value={formData.item_change}
                  onChange={(e) => setFormData({ ...formData, item_change: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #94a3b8', background: 'transparent', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#0284c7', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}