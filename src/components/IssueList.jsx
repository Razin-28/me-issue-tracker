import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function IssueList({ userProfile, refreshTrigger }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      
      // 1. Ambil data isu dari Supabase
      let query = supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      // Tapisan (Filtering)
      if (departmentFilter !== 'All') {
        query = query.eq('department', departmentFilter);
      }
      if (priorityFilter !== 'All') {
        query = query.eq('priority', priorityFilter);
      }
      if (statusFilter !== 'All') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching issues:', error.message);
      } else {
        setIssues(data || []);
      }
      setLoading(false);
    };

    fetchIssues();
  }, [refreshTrigger, departmentFilter, priorityFilter, statusFilter]);

  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case 'High':
        return { backgroundColor: '#dc3545', color: '#fff' };
      case 'Medium':
        return { backgroundColor: '#ffc107', color: '#000' };
      case 'Low':
        return { backgroundColor: '#28a745', color: '#fff' };
      default:
        return { backgroundColor: '#6c757d', color: '#fff' };
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ marginTop: 0, color: '#007bff' }}>Issue Tracker List</h2>

      {/* Filter Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="All">All Departments</option>
          <option value="ME">ME</option>
          <option value="QA">QA</option>
          <option value="PE">PE</option>
        </select>

        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Issues Table */}
      {loading ? (
        <p>Loading issues...</p>
      ) : issues.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#777', padding: '20px 0' }}>No issues found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#007bff', color: '#fff' }}>
              <th style={{ padding: '12px' }}>Title</th>
              <th style={{ padding: '12px' }}>Category</th>
              <th style={{ padding: '12px' }}>Department</th>
              <th style={{ padding: '12px' }}>Priority</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{issue.title}</td>
                <td style={{ padding: '12px' }}>{issue.category || 'General'}</td>
                <td style={{ padding: '12px' }}>{issue.department}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', ...getPriorityBadgeStyle(issue.priority) }}>
                    {issue.priority}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: issue.status === 'Open' ? '#e2e3e5' : '#d4edda', color: '#333', fontSize: '12px' }}>
                    {issue.status}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>
                  {issue.created_at ? new Date(issue.created_at).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}