import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export default function DashboardAnalytics() {
  const [loading, setLoading] = useState(true);
  
  // State Penapis
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'preset', 'custom'
  const [timeRange, setTimeRange] = useState('all'); // 'day', 'week', 'month', 'year'
  
  // State Bulan & Tahun Spesifik
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, completed: 0 });
  const [statusData, setStatusData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [classificationData, setClassificationData] = useState([]);
  const [showAllLocations, setShowAllLocations] = useState(false);

  // Senarai Bulan
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Senarai Tahun
  const years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

  // Fetch and filter analytics data
  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    const { data: issues, error } = await supabase.from('issues').select('*');

    if (error) {
      console.error('Error fetching issues:', error.message);
      setLoading(false);
      return;
    }

    if (issues) {
      const now = new Date();

      const filteredIssues = issues.filter((item) => {
        if (filterMode === 'all') return true;

        const rawDateStr = item.date_time || item.created_at || item.created_date;
        if (!rawDateStr) return false;

        const dateOnlyStr = rawDateStr.split('T')[0].split(' ')[0];
        if (!dateOnlyStr || !dateOnlyStr.includes('-')) return false;

        const [year, month, day] = dateOnlyStr.split('-').map(Number);
        const issueDate = new Date(year, month - 1, day);

        if (filterMode === 'preset') {
          const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const diffInTime = todayDate.getTime() - issueDate.getTime();
          const diffInDays = Math.round(diffInTime / (1000 * 3600 * 24));

          if (timeRange === 'day') return diffInDays === 0;
          if (timeRange === 'week') return diffInDays >= 0 && diffInDays <= 7;
          if (timeRange === 'month') return diffInDays >= 0 && diffInDays <= 30;
          if (timeRange === 'year') return diffInDays >= 0 && diffInDays <= 365;
        }

        if (filterMode === 'custom') {
          const isMonthMatch = selectedMonth === 'all' || (year === Number(selectedYear) && month === Number(selectedMonth));
          const isYearMatch = year === Number(selectedYear);

          if (selectedMonth === 'all') {
            return isYearMatch;
          }
          return isMonthMatch && isYearMatch;
        }

        return true;
      });

      let openCount = 0;
      let inProgressCount = 0;
      let completedCount = 0;
      const locationMap = {};
      const classificationMap = {};

      filteredIssues.forEach((item) => {
        // Status Count
        const status = (item.status || 'Open').trim().toLowerCase();
        if (status === 'completed' || status === 'complete') {
          completedCount++;
        } else if (status === 'in progress' || status === 'in-progress') {
          inProgressCount++;
        } else {
          openCount++;
        }

        // Location Map
        const loc = item.location ? item.location.toUpperCase() : 'UNKNOWN';
        locationMap[loc] = (locationMap[loc] || 0) + 1;

        // Classification Map
        const classKey = item.classification ? `Class ${item.classification.toUpperCase()}` : 'UNCLASSIFIED';
        classificationMap[classKey] = (classificationMap[classKey] || 0) + 1;
      });

      setStats({
        total: filteredIssues.length,
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

      const sortedClassifications = Object.keys(classificationMap)
        .map((cls) => ({ classification: cls, count: classificationMap[cls] }))
        .sort((a, b) => b.count - a.count);

      setClassificationData(sortedClassifications);
    }
    setLoading(false);
  }, [filterMode, timeRange, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const displayedLocationData = showAllLocations ? locationData : locationData.slice(0, 20);
  const chartWidth = showAllLocations ? Math.max(1000, locationData.length * 45) : '100%';

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#0d3b66', padding: '15px 20px', borderRadius: '8px', color: '#fff', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>Dashboard Analytics</h2>
        
        {/* Dropdown Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: '5px', border: 'none', fontWeight: 'bold', cursor: 'pointer', color: '#0d3b66' }}
          >
            <option value="all">All Time</option>
            <option value="preset">Quick Range</option>
            <option value="custom">Specific Month & Year</option>
          </select>

          {filterMode === 'preset' && (
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: '5px', border: 'none', fontWeight: 'bold', cursor: 'pointer', color: '#0d3b66' }}
            >
              <option value="day">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
              <option value="year">Past 365 Days</option>
            </select>
          )}

          {filterMode === 'custom' && (
            <>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '5px', border: 'none', fontWeight: 'bold', cursor: 'pointer', color: '#0d3b66' }}
              >
                <option value="all">All Months</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '5px', border: 'none', fontWeight: 'bold', cursor: 'pointer', color: '#0d3b66' }}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </>
          )}

        </div>
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

          {/* Charts Layout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* Row 1: Pie Chart Status & Classification Bar Chart */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* Graf 1: Issue Status Distribution */}
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginTop: 0, color: '#0d3b66', fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  📊 Issue Status Distribution
                </h3>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label>
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

              {/* Graf 2: Issues Breakdown by Classification */}
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginTop: 0, color: '#0d3b66', fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  🏷️ Issues Breakdown by Classification
                </h3>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classificationData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="classification" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4b5563" name="Total Issues" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Row 2: Issues Breakdown by Location */}
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