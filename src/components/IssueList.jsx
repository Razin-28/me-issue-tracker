import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function IssueList({ onBackToDashboard }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Carian, Filter Status & Filter Tarikh
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD dari input date

  // State untuk modal update progress
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [progressNote, setProgressNote] = useState('');
  const [updating, setUpdating] = useState(false);

  // Ambil senarai isu daripada Supabase
  const fetchIssues = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      alert('Error fetching issues: ' + error.message);
    } else {
      setIssues(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // Format Tarikh & Masa kepada DD/MM/YY (e.g. 08/06/26, 2:22 PM)
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '-';
    const date = new Date(dateTimeStr);
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `${day}/${month}/${year}, ${timeStr}`;
  };

  // Format Tarikh Sahaja kepada DD/MM/YY (e.g. untuk Est. Closing)
  const formatDateOnly = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    return `${day}/${month}/${year}`;
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const now = new Date().toISOString();

    const { error } = await supabase
      .from('issues')
      .update({
        status: newStatus,
        progress_note: progressNote,
        updated_at: now,
      })
      .eq('id', selectedIssue.id);

    if (error) {
      alert('Failed to update progress: ' + error.message);
    } else {
      alert('Progress updated successfully!');
      setSelectedIssue(null);
      setProgressNote('');
      fetchIssues();
    }
    setUpdating(false);
  };

  // Penapisan isu berdasarkan Carian, Status & Tarikh (Date)
  const filteredIssues = issues.filter((issue) => {
    // 1. Semak Carian (Search)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (issue.what_issue && issue.what_issue.toLowerCase().includes(searchLower)) ||
      (issue.staff_id && issue.staff_id.toLowerCase().includes(searchLower)) ||
      (issue.location && issue.location.toLowerCase().includes(searchLower)) ||
      (issue.pic && issue.pic.toLowerCase().includes(searchLower));

    // 2. Semak Filter Status
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      if (statusFilter === 'Completed') {
        matchesStatus = issue.status === 'Completed' || issue.status === 'Complete';
      } else {
        matchesStatus = issue.status === statusFilter;
      }
    }

    // 3. Semak Filter Tarikh (Semak Tarikh Isu ATAU Tarikh Est. Closing)
    let matchesDate = true;
    if (dateFilter) {
      // Tarikh Isu Dicipta / Dikemas kini
      const issueDateStr = issue.updated_at || issue.created_at;
      const issueFormattedDate = issueDateStr ? new Date(issueDateStr).toISOString().split('T')[0] : '';

      // Tarikh Est. Closing
      let estClosingFormattedDate = '';
      if (issue.estimated_closing) {
        const estDate = new Date(issue.estimated_closing);
        if (!isNaN(estDate.getTime())) {
          estClosingFormattedDate = estDate.toISOString().split('T')[0];
        } else {
          estClosingFormattedDate = issue.estimated_closing;
        }
      }

      // Padan jika Date biasa ATAU Est. Closing sama dengan dateFilter
      matchesDate = (issueFormattedDate === dateFilter) || (estClosingFormattedDate === dateFilter);
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      
      {/* Header Bar - Tajuk di Tengah */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', backgroundColor: '#0d3b66', padding: '15px 20px', borderRadius: '8px', color: '#fff' }}>
        <h2 style={{ margin: 0, fontSize: '22px', textAlign: 'center' }}>Issue List</h2>
      </div>

      {/* Bar Carian & Penapis (Search & Filter Bar) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: '12px 16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        
        {/* Input Carian (Search Bar) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '220px' }}>
          <span style={{ fontSize: '16px' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#888', fontWeight: 'bold' }}
            >
              ✖
            </button>
          )}
        </div>

        {/* Filter Tarikh (Date / Est. Closing) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#333' }}>📅 Date:</span>
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '12px', cursor: 'pointer' }}
          />
          {dateFilter && (
            <button 
              onClick={() => setDateFilter('')}
              style={{ border: 'none', backgroundColor: '#dc3545', color: '#fff', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Status */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#333' }}>Filter:</span>
          {['All', 'Open', 'In Progress', 'Completed'].map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: isActive ? '#0d3b66' : '#e9ecef',
                  color: isActive ? '#fff' : '#495057',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {status}
              </button>
            );
          })}
        </div>

      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading issues...</p>
      ) : filteredIssues.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>No issues found matching your search or filter.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
          {filteredIssues.map((issue) => {
            const isCompleted = issue.status === 'Completed' || issue.status === 'Complete';
            const statusColor = isCompleted ? '#28a745' : issue.status === 'In Progress' ? '#ffc107' : '#dc3545';
            const textColor = issue.status === 'In Progress' ? '#000' : '#fff';

            return (
              <div 
                key={issue.id} 
                style={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '6px', 
                  padding: '14px', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between'
                }}
              >
                <div>
                  {/* Format Date: DD/MM/YY */}
                  <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                    📅 Date: {formatDateTime(issue.updated_at || issue.created_at)}
                  </div>

                  {/* Main Issue */}
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#0d3b66', marginBottom: '10px', textTransform: 'capitalize' }}>
                    {issue.what_issue || 'Untitled Issue'}
                  </div>

                  {/* Maklumat Kad */}
                  <div style={{ fontSize: '12px', color: '#444', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
                    <div>🆔 <b>ID Staff:</b> {issue.staff_id || '-'}</div>
                    <div>📍 <b>Location:</b> {issue.location || '-'}</div>
                    <div>👤 <b>PIC:</b> {issue.pic || '-'}</div>
                    <div>🎯 <b>Est. Closing:</b> {formatDateOnly(issue.estimated_closing)}</div>

                    {issue.progress_note && (
                      <div style={{ fontStyle: 'italic', color: '#555', backgroundColor: '#f9f9f9', padding: '6px 8px', borderRadius: '4px', marginTop: '4px', fontSize: '11px' }}>
                        💬 <b>Progress:</b> {issue.progress_note}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status, View & Update Progress */}
                <div style={{ borderTop: '1px solid #eee', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  
                  {/* Status Badge */}
                  <span style={{ 
                    backgroundColor: statusColor, 
                    color: textColor, 
                    padding: '4px 10px', 
                    borderRadius: '4px', 
                    fontSize: '11px', 
                    fontWeight: 'bold' 
                  }}>
                    {issue.status || 'Open'}
                  </span>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* Butang View */}
                    {issue.file_url && (
                      <a 
                        href={issue.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ fontSize: '11px', color: '#0d3b66', fontWeight: 'bold', textDecoration: 'none', padding: '4px 8px', border: '1px solid #0d3b66', borderRadius: '4px', backgroundColor: '#fff' }}
                      >
                        👁️ View
                      </a>
                    )}
                    
                    {/* Butang Update Progress */}
                    <button 
                      onClick={() => {
                        setSelectedIssue(issue);
                        setNewStatus(issue.status || 'In Progress');
                        setProgressNote(issue.progress_note || '');
                      }}
                      style={{ 
                        border: 'none', 
                        backgroundColor: '#e9ecef', 
                        cursor: 'pointer', 
                        padding: '5px 10px', 
                        borderRadius: '4px', 
                        fontSize: '11px', 
                        fontWeight: 'bold',
                        color: '#333'
                      }}
                    >
                      ✏️ Update Progress
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal Pop-up */}
      {selectedIssue && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '420px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#0d3b66' }}>Update Progress & Status</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}><b>Issue:</b> {selectedIssue.what_issue}</p>

            <form onSubmit={handleUpdateProgress}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>Status:</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>Progress Note / Updates:</label>
                <textarea 
                  rows="3"
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                  placeholder="E.g., Replacement part ordered..."
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setSelectedIssue(null)}
                  style={{ padding: '8px 12px', border: 'none', backgroundColor: '#ccc', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updating}
                  style={{ padding: '8px 12px', border: 'none', backgroundColor: '#0d3b66', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {updating ? 'Saving...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}