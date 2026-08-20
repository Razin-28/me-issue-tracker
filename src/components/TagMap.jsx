import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";

export default function TagMap({ onBack }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State untuk form input
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [requestor, setRequestor] = useState("");
  const [tagVersion, setTagVersion] = useState("");
  const [itemChange, setItemChange] = useState("");

  // 1. Ambil data sedia ada dari Supabase
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

  // 2. Simpan maklumat baru ke Supabase & masukkan ke jadual
  const handleAddUpdate = async (e) => {
    e.preventDefault();

    if (!requestor.trim() || !tagVersion.trim() || !itemChange.trim()) {
      alert("Sila lengkapkan semua maklumat borang.");
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
      alert("Gagal menyimpan: " + error.message);
    } else {
      // Reset input borang
      setRequestor("");
      setTagVersion("");
      setItemChange("");
      setDate(new Date().toISOString().split("T")[0]);
      // Kemas kini paparan jadual
      fetchTagMapUpdates();
    }
    setSubmitting(false);
  };

  return (
    <div style={{ padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Navigation Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ margin: 0, color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
          🚪 Exit
        </h3>
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
          padding: "14px",
          borderRadius: "8px",
          textAlign: "center",
          fontSize: "20px",
          fontWeight: "bold",
          marginBottom: "24px",
          letterSpacing: "0.5px",
        }}
      >
        TagMap Updates
      </div>

      {/* BORANG INPUT (FORM CARD) */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "24px",
          border: "1px solid #e2e8f0",
        }}
      >
        <h4 style={{ margin: "0 0 16px 0", color: "#0c4a6e" }}>➕ Add New TagMap Update</h4>
        <form onSubmit={handleAddUpdate}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "5px", color: "#334155" }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "5px", color: "#334155" }}>
                Requestor
              </label>
              <input
                type="text"
                placeholder="Name / ID"
                value={requestor}
                onChange={(e) => setRequestor(e.target.value)}
                style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "5px", color: "#334155" }}>
                Tag. Version
              </label>
              <input
                type="text"
                placeholder="e.g. v1.0.2"
                value={tagVersion}
                onChange={(e) => setTagVersion(e.target.value)}
                style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "5px", color: "#334155" }}>
                Item Change
              </label>
              <input
                type="text"
                placeholder="Description of changes"
                value={itemChange}
                onChange={(e) => setItemChange(e.target.value)}
                style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
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
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid #e2e8f0",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#0c4a6e", color: "#ffffff", fontSize: "14px" }}>
              <th style={{ padding: "12px 16px", width: "60px", textAlign: "center" }}>No.</th>
              <th style={{ padding: "12px 16px", width: "130px" }}>Date</th>
              <th style={{ padding: "12px 16px", width: "180px" }}>Requestor</th>
              <th style={{ padding: "12px 16px", width: "160px" }}>Tag. Version</th>
              <th style={{ padding: "12px 16px" }}>Item Change</th>
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
                  <td style={{ padding: "12px 16px", textAlign: "center", color: "#64748b" }}>{index + 1}</td>
                  <td style={{ padding: "12px 16px", color: "#334155" }}>{item.date}</td>
                  <td style={{ padding: "12px 16px", color: "#0f172a", fontWeight: "600" }}>{item.requestor}</td>
                  <td style={{ padding: "12px 16px", color: "#0369a1", fontWeight: "bold" }}>{item.tag_version}</td>
                  <td style={{ padding: "12px 16px", color: "#334155" }}>{item.item_change}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}