import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export default function DashboardAnalytics({ onBack }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedClassification, setSelectedClassification] = useState(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('issues')
      .select('*');

    if (error) {
      console.error('Error fetching analytics data:', error);
    } else {
      setIssues(data || []);
    }
    setLoading(false);
  };

  // 1. Tapis Data Berdasarkan Masa, Group, dan Classification
  const filteredData = useMemo(() => {
    const now = new Date();

    return issues.filter((item) => {
      // Penapis Masa
      const itemDate = new Date(item.date_time || item.created_at);
      let passTime = true;
      if (timeFilter === 'Today') {
        passTime = itemDate.toDateString() === now.toDateString();
      } else if (timeFilter === 'This Week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        passTime = itemDate >= weekAgo;
      } else if (timeFilter === 'This Month') {
        passTime =
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getFullYear() === now.getFullYear();
      }

      // Penapis Group (Assembly Line, Test Line, Transmission, IT)
      let passGroup = true;
      if (selectedGroup !== 'All') {
        passGroup = item.group_name === selectedGroup;
      }

      // Penapis Klasifikasi Interaktif (Bar Chart Click)
      let passClassification = true;
      if (selectedClassification) {
        passClassification = item.classification === selectedClassification;
      }

      return passTime && passGroup && passClassification;
    });
  }, [issues, timeFilter, selectedGroup, selectedClassification]);

  // 2. Kiraan Kad Metrik
  const metrics = useMemo(() => {
    let total = filteredData.length;
    let open = 0;
    let inProgress = 0;
    let closed = 0;

    filteredData.forEach((item) => {
      const status = item.status || 'Open';
      if (status === 'Open') {
        open++;
      } else if (status.includes('In Progress')) {
        inProgress++;
      } else if (status === 'Closed' || status === 'Completed' || status === 'Complete') {
        closed++;
      }
    });

    return { total, open, inProgress, closed };
  }, [filteredData]);

  // 3. Data untuk Status Pie Chart
  const statusPieData = useMemo(() => {
    const data = [
      { name: 'Open Issues', value: metrics.open, color: '#e63946' },
      { name: 'In Progress', value: metrics.inProgress, color: '#f59e0b' },
      { name: 'Closed', value: metrics.closed, color: '#16a34a' },
    ];
    return data.filter(d => d.value > 0);
  }, [metrics]);

  // 4. Data untuk Classification Bar Chart
  const classificationData = useMemo(() => {
    // Kiraan klasifikasi hanya berdasarkan Masa & Group supaya tidak terikat pada klik semasa
    const baseGroupData = issues.filter((item) => {
      const itemDate = new Date(item.date_time || item.created_at);
      const now = new Date();
      let passTime = true;
      if (timeFilter === 'Today') passTime = itemDate.toDateString() === now.toDateString();
      if (timeFilter === 'This Week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        passTime = itemDate >= weekAgo;
      }
      if (timeFilter === 'This Month') {
        passTime = itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      }

      let passGroup = true;
      if (selectedGroup !== 'All') passGroup = item.group_name === selectedGroup;
      return passTime && passGroup;
    });

    let countA = 0;
    let countB = 0;
    let countC = 0;

    baseGroupData.forEach((item) => {
      if (item.classification === 'A') countA++;
      else if (item.classification === 'B') countB++;
      else if (item.classification === 'C') countC++;
    });

    return [
      { name: 'Class A', count: countA, classCode: 'A' },
      { name: 'Class B', count: countB, classCode: 'B' },
      { name: 'Class C', count: countC, classCode: 'C' },
    ];
  }, [issues, timeFilter, selectedGroup]);

  // Formula label peratusan (%) untuk Pie Chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 22;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#333"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(1)}% (${value})`}
      </text>
    );
  };

  return (
    <div style={{ padding: '10px 20px 40px', maxWidth: '1280px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header Bar dengan Filter Dropdowns */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0d3b66',
        padding: '12px 20px',
        borderRadius: '8px',
        color: '#fff',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>Dashboard Analytics</h2>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Dropdown Filter Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Group:</span>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '5px',
                border: 'none',
                fontWeight: 'bold',
                color: '#0d3b66',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              <option value="All">All Groups</option>
              <option value="Assembly Line">Assembly Line</option>
              <option value="Test Line">Test Line</option>
              <option value="Transmission">Transmission</option>
              <option value="IT">IT</option>
            </select>
          </div>

          {/* Dropdown Filter Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Time:</span>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '5px',
                border: 'none',
                fontWeight: 'bold',
                color: '#0d3b66',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

          {/* Reset Filter Button jika ada bar diklik */}
          {selectedClassification && (
            <button
              onClick={() => setSelectedClassification(null)}
              style={{
                backgroundColor: '#e63946',
                color: '#fff',
                border: 'none',
                padding: '7px 10px',
                borderRadius: '5px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Clear Class {selectedClassification} ✕
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading analytics...</p>
      ) : (
        <>
          {/* 4 Cards Counter (Auto update bila group ditukar) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '25px'
          }}>
            {/* TOTAL */}
            <div style={{
              backgroundColor: '#fff',
              padding: '18px 20px',
              borderRadius: '8px',
              borderLeft: '5px solid #0d3b66',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                TOTAL ISSUES {selectedGroup !== 'All' && `(${selectedGroup})`}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0d3b66', marginTop: '6px' }}>
                {metrics.total}
              </div>
            </div>

            {/* OPEN */}
            <div style={{
              backgroundColor: '#fff',
              padding: '18px 20px',
              borderRadius: '8px',
              borderLeft: '5px solid #e63946',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                OPEN ISSUES
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e63946', marginTop: '6px' }}>
                {metrics.open}
              </div>
            </div>

            {/* IN PROGRESS */}
            <div style={{
              backgroundColor: '#fff',
              padding: '18px 20px',
              borderRadius: '8px',
              borderLeft: '5px solid #f59e0b',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                IN PROGRESS
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginTop: '6px' }}>
                {metrics.inProgress}
              </div>
            </div>

            {/* CLOSED */}
            <div style={{
              backgroundColor: '#fff',
              padding: '18px 20px',
              borderRadius: '8px',
              borderLeft: '5px solid #16a34a',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                CLOSED
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a', marginTop: '6px' }}>
                {metrics.closed}
              </div>
            </div>
          </div>

          {/* 2 Charts Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: '20px'
          }}>
            
            {/* Pie Chart: Status Distribution by Percent % */}
            <div style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ fontSize: '15px', color: '#333', marginTop: 0, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📊 Issue Status Distribution (%) {selectedGroup !== 'All' && `- ${selectedGroup}`}
              </h3>

              {statusPieData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '70px 20px', color: '#94a3b8' }}>
                  No issues recorded for this selection.
                </div>
              ) : (
                <div style={{ width: '100%', height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        labelLine={true}
                        label={renderCustomizedLabel}
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val, name) => [
                          `${val} (${((val / metrics.total) * 100).toFixed(1)}%)`,
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Bar Chart: Classification */}
            <div style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ fontSize: '15px', color: '#333', marginTop: 0, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🏷️ Classification (Click bar to cross-filter)
              </h3>

              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={classificationData}
                    onClick={(state) => {
                      if (state && state.activePayload && state.activePayload[0]) {
                        const clickedClass = state.activePayload[0].payload.classCode;
                        setSelectedClassification((prev) => (prev === clickedClass ? null : clickedClass));
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis allowDecimals={false} stroke="#64748b" />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="#475569"
                      radius={[4, 4, 0, 0]}
                      cursor="pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}