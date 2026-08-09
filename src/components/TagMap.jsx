import React from 'react';

export default function TagMapUpdates({ onBackToDashboard }) {
  // Contoh data berasingan khusus untuk TagMap (boleh digantikan dengan fetch Supabase jika perlu)
  const tagMapData = [];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', backgroundColor: '#0d3b66', padding: '15px 20px', borderRadius: '8px', color: '#fff' }}>
        <h2 style={{ margin: 0, fontSize: '22px', textAlign: 'center' }}>TagMap Updates</h2>
      </div>

      {/* Table Section */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#0d3b66', color: '#fff' }}>
              <th style={{ padding: '12px 15px', borderBottom: '2px solid #ddd', width: '60px', textAlign: 'center' }}>No.</th>
              <th style={{ padding: '12px 15px', borderBottom: '2px solid #ddd', width: '120px' }}>Date</th>
              <th style={{ padding: '12px 15px', borderBottom: '2px solid #ddd' }}>Requestor</th>
              <th style={{ padding: '12px 15px', borderBottom: '2px solid #ddd' }}>Tag. Version</th>
              <th style={{ padding: '12px 15px', borderBottom: '2px solid #ddd' }}>Item Change</th>
            </tr>
          </thead>
          <tbody>
            {tagMapData.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                  No TagMap updates available.
                </td>
              </tr>
            ) : (
              tagMapData.map((row, index) => (
                <tr 
                  key={row.id || index} 
                  style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff', borderBottom: '1px solid #eee' }}
                >
                  <td style={{ padding: '10px 15px', textAlign: 'center', fontWeight: 'bold', color: '#555' }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: '10px 15px' }}>{row.date || '-'}</td>
                  <td style={{ padding: '10px 15px' }}>{row.requestor || '-'}</td>
                  <td style={{ padding: '10px 15px', fontWeight: 'bold', color: '#0d3b66' }}>
                    {row.tag_version || '-'}
                  </td>
                  <td style={{ padding: '10px 15px' }}>{row.item_change || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}