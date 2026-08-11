import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function IssueList({ onBackToDashboard }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for Search, Status Filter & Date Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // State for progress update modal
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [progressNote, setProgressNote] = useState('');
  const [updating, setUpdating] = useState(false);

  // Fetch issue list from Supabase
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

  // Delete Issue Function
  const handleDeleteIssue = async (issueId, issueTitle) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the issue "${issueTitle || 'this issue'}"?`);
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('id', issueId);

    if (error) {
      alert('Failed to delete issue: ' + error.message);
    } else {
      alert('Issue deleted successfully!');
      fetchIssues();
    }
  };

  // Format Tarikh & Masa dengan cara memotong string terus (Bypass UTC Offset)
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '-';
    
    // Asingkan tarikh dan masa berasaskan ruang atau huruf 'T'
    const cleanStr = dateTimeStr.replace('T', ' ');
    const [datePart, timePart] = cleanStr.split(' ');

    if (datePart && datePart.includes('-')) {
      const [year, month, day] = datePart.split('-');
      let formattedTime = '';

      if (timePart) {
        const timeSegments = timePart.split(':');
        let hours = parseInt(timeSegments[0], 10);
        const minutes = timeSegments[1];

        if (!isNaN(hours)) {
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12; // Tukar 0 kepada 12
          formattedTime = `, ${hours}:${minutes} ${ampm}`;
        }
      }

      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year.slice(-2)}${formattedTime}`;
    }

    return dateTimeStr;
  };

  // Format Date Only (DD/MM/YY)
  const formatDateOnly = (dateStr) => {
    if (!dateStr) return '-';
    const dateOnlyPart = dateStr.split('T')[0].split(' ')[0];
    if (dateOnlyPart && dateOnlyPart.includes('-')) {
      const [year, month, day] = dateOnlyPart.split('-');
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year.slice(-2)}`;
    }
    return dateStr;
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

  // Filter issues based on Search, Status & Date
  const filteredIssues = issues.filter((issue) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (issue.what_issue && issue.what_issue.toLowerCase().includes(searchLower)) ||
      (issue.staff_id && issue.staff_id.toLowerCase().includes(searchLower)) ||
      (issue.location && issue.location.toLowerCase().includes(searchLower)) ||
      (issue.pic && issue.pic.toLowerCase().includes(searchLower));

    let matchesStatus = true;
    if (statusFilter !== 'All') {
      if (statusFilter === 'Completed') {
        matchesStatus = issue.status === 'Completed' || issue.status === 'Complete';
      } else {
        matchesStatus = issue.status === statusFilter;
      }
    }

    let matchesDate = true;
    if (dateFilter) {
      const issueDateStr = issue.date_time || issue.created_at;
      const issueFormattedDate = issueDateStr ? issueDateStr.split('T')[0].split(' ')[0] : '';

      let estClosingFormattedDate = '';
      if (issue.estimated_closing) {
        estClosingFormattedDate = issue.estimated_closing.split('T')[0].split(' ')[0];
      }

      matchesDate = (issueFormattedDate === dateFilter) || (estClosingFormattedDate === dateFilter);
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', backgroundColor: '#0d3b66', padding: '15px 20px', borderRadius: '8px', color: '#fff' }}>
        <h2 style={{ margin: 0, fontSize: '22px', textAlign: 'center' }}>Issue List</h2>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: '12px 16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '220px' }}>
          <span style={{ fontSize: '16px' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Search..." 
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

        {/* Date Filter */}
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

        {/* Status Filter */}
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
        <p style={{ textAlign: 'center', padding: '40px' }}>No issues found matching your search or filter criteria.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
          {filteredIssues.map((issue) => {
            const isCompleted = issue.status === 'Completed' || issue.status === 'Complete';
            const statusColor = isCompleted ? '#28a745' : issue.status === 'In Progress' ? '#ffc107' : '#dc3545';
            const textColor = issue.status === 'In Progress' ? '#000' : '#fff';

            // Mengambil terus string raw date_time tanpa convert timezone
            const manualDate = issue.date_time || issue.created_at;

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
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                    📅 Date: {formatDateTime(manualDate)}
                  </div>

                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#0d3b66', marginBottom: '10px', textTransform: 'capitalize' }}>
                    {issue.what_issue || 'Untitled Issue'}
                  </div>

                  <div style={{ fontSize: '12px', color: '#444', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
                    <div>🆔 <b>Staff ID:</b> {issue.staff_id || '-'}</div>
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

                <div style={{ borderTop: '1px solid #eee', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  
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

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
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
                        padding: '5px 8px', 
                        borderRadius: '4px', 
                        fontSize: '11px', 
                        fontWeight: 'bold',
                        color: '#333'
                      }}
                    >
                      ✏️ Update
                    </button>

                    <button 
                      onClick={() => handleDeleteIssue(issue.id, issue.what_issue)}
                      style={{ 
                        border: 'none', 
                        backgroundColor: '#dc3545', 
                        color: '#fff',
                        cursor: 'pointer', 
                        padding: '5px 8px', 
                        borderRadius: '4px', 
                        fontSize: '11px', 
                        fontWeight: 'bold'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Update Progress Modal */}
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
                  placeholder="Enter progress notes or updates here..."
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