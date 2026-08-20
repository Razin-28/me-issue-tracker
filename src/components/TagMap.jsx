import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function TagMap({ onBack }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State untuk form input
  const [editingId, setEditingId] = useState(null); // ID rekod yang sedang diedit (null jika mod tambah baharu)
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [requestor, setRequestor] = useState("");
  const [tagVersion, setTagVersion] = useState("");
  const [itemChange, setItemChange] = useState("");

  // 1. Fetch data from Supabase (Sorted by date descending)
  const fetchTagMapUpdates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tagmap_updates")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUpdates(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTagMapUpdates();
  }, []);

  // Reset borang ke keadaan asal
  const resetForm = () => {
    setEditingId(null);
    setDate(new Date().toISOString().split("T")[0]);
    setRequestor("");
    setTagVersion("");
    setItemChange("");
  };

  // 2. Masuk ke mod Edit
  const handleEdit = (item) => {
    setEditingId(item.id);
    setDate(item.date);
    setRequestor(item.requestor);
    setTagVersion(item.tag_version);
    setItemChange(item.item_change);
    // Skrol perlahan ke atas untuk terus edit
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 3. Simpan rekod (Tambah Baharu ATAU Kemas Kini)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!requestor.trim() || !tagVersion.trim() || !itemChange.trim()) {
      alert("Please complete all fields.");
      return;
    }

    setSubmitting(true);
    const payload = {
      date: date,
      requestor: requestor.trim(),
      tag_version: tagVersion.trim(),
      item_change: itemChange.trim(),
    };

    if (editingId) {
      // Mod UPDATE
      const { error } = await supabase
        .from("tagmap_updates")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        alert("Failed to update: " + error.message);
      } else {
        resetForm();
        fetchTagMapUpdates();
      }
    } else {
      // Mod INSERT
      const { error } = await supabase
        .from("tagmap_updates")
        .insert([payload]);

      if (error) {
        alert("Failed to save: " + error.message);
      } else {
        resetForm();
        fetchTagMapUpdates();
      }
    }
    setSubmitting(false);
  };

  // 4. Delete record from Supabase
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("tagmap_updates")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Failed to delete: " + error.message);
    } else {
      if (editingId === id) resetForm();
      setUpdates(updates.filter((item) => item.id !== id));
    }
  };

  return (
    <div style={{ padding: "24px 32px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Top Navigation */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              backgroundColor: "#ffffff",
              color: "#2563eb",
              border: "1px solid #2563eb",
              padding: "8px 16px",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ⬅ Back to Dashboard
          </button>
        )}
      </div>

      {/* Banner Title */}
      <div
        style={{
          backgroundColor: "#0c4a6e",
          color: "#ffffff",
          padding: "16px",
          borderRadius: "8px",
          textAlign: "center",
          fontSize: "22px",
          fontWeight: "bold",
          marginBottom: "24px",
          letterSpacing: "0.5px",
        }}
      >
        TagMap Updates
      </div>

      {/* Input / Edit Form */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "24px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          marginBottom: "24px",
          border: editingId ? "2px solid #0284c7" : "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h4 style={{ margin: 0, color: "#0c4a6e", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "18px" }}>{editingId ? "✏️" : "➕"}</span>
            {editingId ? "Edit TagMap Update" : "Add New TagMap Update"}
          </h4>
          {editingId && (
            <span style={{ fontSize: "12px", color: "#0284c7", fontWeight: "600", backgroundColor: "#e0f2fe", padding: "4px 8px", borderRadius: "4px" }}>
              Editing Mode
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#334155" }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#334155" }}>
                Requestor
              </label>
              <input
                type="text"
                placeholder="Name / ID"
                value={requestor}
                onChange={(e) => setRequestor(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#334155" }}>
                Tag. Version
              </label>
              <input
                type="text"
                placeholder="e.g. v1.0.2"
                value={tagVersion}
                onChange={(e) => setTagVersion(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#334155" }}>
                Item Change
              </label>
              <input
                type="text"
                placeholder="Description of changes"
                value={itemChange}
                onChange={(e) => setItemChange(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  padding: "10px 18px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: editingId ? "#0284c7" : "#0284c7",
                color: "#ffffff",
                border: "none",
                padding: "10px 24px",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {submitting ? "Saving..." : editingId ? "Update Record" : "Submit Record"}
            </button>
          </div>
        </form>
      </div>

      {/* Data Table */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          border: "1px solid #e2e8f0",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#0c4a6e", color: "#ffffff", fontSize: "14px" }}>
              <th style={{ padding: "14px 18px", width: "50px", textAlign: "center" }}>No.</th>
              <th style={{ padding: "14px 18px", width: "130px" }}>Date</th>
              <th style={{ padding: "14px 18px", width: "180px" }}>Requestor</th>
              <th style={{ padding: "14px 18px", width: "140px" }}>Tag. Version</th>
              <th style={{ padding: "14px 18px" }}>Item Change</th>
              <th style={{ padding: "14px 18px", width: "140px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                  Loading updates...
                </td>
              </tr>
            ) : updates.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                  No TagMap updates available.
                </td>
              </tr>
            ) : (
              updates.map((item, index) => (
                <tr
                  key={item.id || index}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    backgroundColor: editingId === item.id ? "#f0f9ff" : "transparent",
                  }}
                >
                  <td style={{ padding: "14px 18px", textAlign: "center", color: "#64748b" }}>{index + 1}</td>
                  <td style={{ padding: "14px 18px", color: "#334155" }}>{item.date}</td>
                  <td style={{ padding: "14px 18px", color: "#0f172a", fontWeight: "600" }}>{item.requestor}</td>
                  <td style={{ padding: "14px 18px", color: "#0284c7", fontWeight: "bold" }}>{item.tag_version}</td>
                  <td style={{ padding: "14px 18px", color: "#334155" }}>{item.item_change}</td>
                  <td style={{ padding: "14px 18px", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                      <button
                        onClick={() => handleEdit(item)}
                        style={{
                          backgroundColor: "#e0f2fe",
                          color: "#0369a1",
                          border: "1px solid #bae6fd",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          fontWeight: "600",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                        title="Edit this record"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{
                          backgroundColor: "#fee2e2",
                          color: "#dc2626",
                          border: "1px solid #fecaca",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          fontWeight: "600",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                        title="Delete this record"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}