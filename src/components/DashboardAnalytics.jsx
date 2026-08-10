import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export default function DashboardAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, completed: 0 });
  const [statusData, setStatusData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [showAllLocations, setShowAllLocations] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    const { data: issues, error } = await supabase.from('issues').select('*');

    if (error) {
      console.error('Error fetching issues:', error.message);
      setLoading(false);
      return;
    }

    if (issues) {
      let openCount = 0;
      let inProgressCount = 0;
      let completedCount = 0;
      const locationMap = {};

      issues.forEach((item) => {
        const status = (item.status || 'Open').toLowerCase();
        if (status === 'completed' || status === 'complete') completedCount++;
        else if (status === 'in progress') inProgressCount++;
        else openCount++;

        const loc = item.location ? item.location.toUpperCase() : 'UNKNOWN';
        locationMap[loc] = (locationMap[loc] || 0) + 1;
      });

      setStats({
        total: issues.length,
        open: openCount,
        inProgress: inProgressCount,
        completed: completedCount,
      });

      setStatusData([
        { name: 'Open', value: openCount, color: '#dc3545' },
        { name: 'In Progress', value: inProgressCount, color: '#ffc107' },
        { name: 'Completed', value: completedCount, color: '#28a745' },
      ]);

      const sortedLocations = Object.keys(locationMap)
        .map((loc) => ({ location: loc, count: locationMap[loc] }))
        .sort((a, b) => b.count - a.count);

      setLocationData(sortedLocations);
    }
    setLoading(false);
  };

  const displayedLocationData = showAllLocations ? locationData : locationData.slice(0, 20);
  const chartWidth = showAllLocations ? Math.max(1000, locationData.length * 45) : '100%';

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      
      {/* 🖼️ GAMBAR BANNER BARU YANG ANDA DOWNLOAD */}
      <div style={{ width: '100%', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <img 
          src="/DashboardAnalytics.png" /* <--- Nama gambar dalam folder public/ */
          alt="ME Analytics Banner" 
          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }}
          onError={(e) => { e.target.style.display = 'none'; }} /* Sembunyikan jika gambar tiada */
        />
      </div>

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', backgroundColor: '#0d3b66', padding: '15px 20px', borderRadius: '8px', color: '#fff' }}>
        <h2 style={{ margin: 0, fontSize: '22px', textAlign: 'center' }}>Dashboard Analytics</h2>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading analytics data...</p>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            <div style={{ backgroundColor: '#fff', borderLeft: '6px solid #0d3b66', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '13px', color: '#666', fontWeight: 'bold' }}>TOTAL ISSUES</span>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '28px', color: '#0d3b66' }}>{stats.total}</h2>
            </div>
            <div style={{ backgroundColor: '#fff', borderLeft: '6px solid #dc3545', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '13px', color: '#666', fontWeight: 'bold' }}>OPEN ISSUES</span>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '28px', color: '#dc3545' }}>{stats.open}</h2>
            </div>
            <div style={{ backgroundColor: '#fff', borderLeft: '6px solid #ffc107', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '13px', color: '#666', fontWeight: 'bold' }}>IN PROGRESS</span>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '28px', color: '#d39e00' }}>{stats.inProgress}</h2>
            </div>
            <div style={{ backgroundColor: '#fff', borderLeft: '6px solid #28a745', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '13px', color: '#666', fontWeight: 'bold' }}>COMPLETED</span>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '28px', color: '#28a745' }}>{stats.completed}</h2>
            </div>
          </div>

          {/* Susunan Graf Secara Bertingkat */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* Graf 1: Issue Status Distribution */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginTop: 0, color: '#0d3b66', fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                📊 Issue Status Distribution
              </h3>
              <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={5} dataKey="value" label>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Graf 2: Issues Breakdown by Location / Station */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#0d3b66', fontSize: '16px' }}>
                  📍 Issues Breakdown by Location/Station ({showAllLocations ? 'All' : 'Top 20'})
                </h3>
                <button
                  onClick={() => setShowAllLocations(!showAllLocations)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    borderRadius: '4px',
                    border: '1px solid #0d3b66',
                    backgroundColor: '#fff',
                    color: '#0d3b66',
                    cursor: 'pointer'
                  }}
                >
                  {showAllLocations ? 'Show Top 20' : 'Show All'}
                </button>
              </div>

              <div style={{ width: '100%', height: '350px', overflowX: showAllLocations ? 'auto' : 'hidden' }}>
                <div style={{ width: chartWidth, height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayedLocationData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="location" interval={0} angle={-30} textAnchor="end" height={50} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0d3b66" name="Total Issues" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}