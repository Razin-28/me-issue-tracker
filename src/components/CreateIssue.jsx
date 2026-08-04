import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function CreateIssue({ userProfile, onIssueCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Insert new issue record into Supabase
    const { error } = await supabase.from('issues').insert([
      {
        title: title,
        description: description,
        priority: priority,
        category: category, // Included to prevent 'not-null constraint' error
        status: 'Open',
        department: userProfile?.department || 'ME',
        reported_by: userProfile?.id,
      },
    ]);

    if (error) {
      alert('Failed to submit issue: ' + error.message);
    } else {
      alert('Issue submitted successfully!');
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setCategory('General');
      
      if (onIssueCreated) {
        onIssueCreated();
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '25px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', fontFamily: 'Arial, sans-serif' }}>
      <form onSubmit={handleSubmit}>
        {/* Issue Title */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#333' }}>
            Tajuk Isu / Issue Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter issue title"
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#333' }}>
            Keterangan / Description:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            placeholder="Describe the issue in detail"
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', resize: 'vertical' }}
          />
        </div>

        {/* Category Selection */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#333' }}>
            Kategori / Category:
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: '#fff' }}
          >
            <option value="General">General</option>
            <option value="Machinery">Machinery</option>
            <option value="Quality">Quality</option>
            <option value="Process">Process</option>
            <option value="Safety">Safety</option>
          </select>
        </div>

        {/* Priority Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#333' }}>
            Keutamaan / Priority:
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: '#fff' }}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'background-color 0.2s' }}
        >
          {loading ? 'Submitting...' : 'Submit Issue'}
        </button>
      </form>
    </div>
  );
}