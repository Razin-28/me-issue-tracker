import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function TagMap({ onBack }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State untuk borang input
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [requestor, setRequestor] = useState("");
  const [tagVersion, setTagVersion] = useState("");
  const [itemChange, setItemChange] = useState("");

  // Ambil rekod dari Supabase
  const fetchTagMapUpdates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tagmap_updates")
      .select("*")
      .order("date", { ascending: false });

    if (!error && data) {
      setUpdates(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTagMapUpdates();
  }, []);

  // Simpan rekod baharu ke Supabase
  const handleAddUpdate = async (e) => {
    e.preventDefault();

    if (!requestor.trim() || !tagVersion.trim() || !itemChange.trim()) {
      alert("Sila lengkapkan semua ruangan.");
      return;
    }

    setSubmitting(true);
    const newRecord = {
      date: date,
      requestor: requestor.trim(),
      tag_version: tagVersion.trim(),
      item_change: itemChange.trim(),
    };

    const { error } = await supabase.from("tagmap_updates").insert([newRecord]);

    if (error) {
      alert("Ralat menyimpan: " + error.message);
    } else {
      setRequestor("");
      setTagVersion("");
      setItemChange("");
      setDate(new Date().toISOString().split("T")[0]);
      fetchTagMapUpdates();
    }
    setSubmitting(false);
  };

  return (
    <div style={{ padding: "24px 32px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Top Bar / Navigation */}
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

      {/* BORANG INPUT (FORM) */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "24px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          marginBottom: "24px",
          border: "1px solid #e2e8f0",
        }}
      >
        <h4 style={{ margin: "0 0 16px 0", color: "#0c4a6e", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "18px" }}>➕</span> Add New TagMap Update
        </h4>
        <form onSubmit={handleAddUpdate}>
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

          <div style={{ textAlign: "right" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: "#0284c7",
                color: "#ffffff",
                border: "none",
                padding: "10px 24px",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {submitting ? "Saving..." : "Submit Record"}
            </button>
          </div>
        </form>
      </div>

      {/* JADUAL PAPARAN DATA (TABLE) */}
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
              <th style={{ padding: "14px 18px", width: "60px", textAlign: "center" }}>No.</th>
              <th style={{ padding: "14px 18px", width: "140px" }}>Date</th>
              <th style={{ padding: "14px 18px", width: "200px" }}>Requestor</th>
              <th style={{ padding: "14px 18px", width: "160px" }}>Tag. Version</th>
              <th style={{ padding: "14px 18px" }}>Item Change</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                  Loading updates...
                </td>
              </tr>
            ) : updates.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                  No TagMap updates available.
                </td>
              </tr>
            ) : (
              updates.map((item, index) => (
                <tr key={item.id || index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 18px", textAlign: "center", color: "#64748b" }}>{index + 1}</td>
                  <td style={{ padding: "14px 18px", color: "#334155" }}>{item.date}</td>
                  <td style={{ padding: "14px 18px", color: "#0f172a", fontWeight: "600" }}>{item.requestor}</td>
                  <td style={{ padding: "14px 18px", color: "#0284c7", fontWeight: "bold" }}>{item.tag_version}</td>
                  <td style={{ padding: "14px 18px", color: "#334155" }}>{item.item_change}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}