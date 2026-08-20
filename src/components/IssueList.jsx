import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function IssueList({ onBack }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // State untuk Edit Est. Closing
  const [editingClosingId, setEditingClosingId] = useState(null);
  const [newClosingDate, setNewClosingDate] = useState("");

  const fetchIssues = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setIssues(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // Fungsi simpan Est. Closing baharu
  const handleUpdateClosingDate = async (issueId) => {
    if (!newClosingDate) {
      setEditingClosingId(null);
      return;
    }

    const { error } = await supabase
      .from("issues")
      .update({ target_due_date: newClosingDate })
      .eq("id", issueId);

    if (error) {
      alert("Failed to update target date: " + error.message);
    } else {
      setIssues(
        issues.map((item) =>
          item.id === issueId ? { ...item, target_due_date: newClosingDate } : item
        )
      );
      setEditingClosingId(null);
      setNewClosingDate("");
    }
  };

  // Filter Logic
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      (issue.title && issue.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (issue.group && issue.group.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (issue.location && issue.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (issue.created_by && issue.created_by.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClass =
      selectedClass === "All" ||
      (issue.class && issue.class.toUpperCase() === selectedClass.toUpperCase());

    const matchesDate = !selectedDate || issue.created_date === selectedDate;

    const matchesStatus =
      selectedStatus === "All" ||
      (issue.status && issue.status.toLowerCase() === selectedStatus.toLowerCase());

    return matchesSearch && matchesClass && matchesDate && matchesStatus;
  });

  return (
    <div style={{ padding: "24px 32px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Top Header */}
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
            }}
          >
            ⬅ Back to Dashboard
          </button>
        )}
      </div>

      {/* Title */}
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
        }}
      >
        Issue List
      </div>

      {/* FILTER BAR */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "16px 20px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "center",
          marginBottom: "24px",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 220px" }}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search issue, group, name, locat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
          />
        </div>

        {/* Filter Class (Susunan Tetap All Classes, A, B, C) */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>🏷️ Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", cursor: "pointer" }}
          >
            <option value="All">All Classes</option>
            <option value="A">Class A</option>
            <option value="B">Class B</option>
            <option value="C">Class C</option>
          </select>
        </div>

        {/* Date Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>📅 Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: "7px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate("")}
              style={{ border: "none", background: "transparent", color: "#ef4444", cursor: "pointer", fontWeight: "bold" }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Pill Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155", marginRight: "4px" }}>Status:</span>
          {["All", "Open", "In Progress", "Completed"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                backgroundColor: selectedStatus === status ? "#0c4a6e" : "#f1f5f9",
                color: selectedStatus === status ? "#ffffff" : "#475569",
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ISSUE CARDS GRID */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading issues...</div>
      ) : filteredIssues.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No issues found.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                padding: "18px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {/* Card Header: Date & Class */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#64748b" }}>
                <span>📅 Date: {issue.created_date || "-"}</span>
                <span
                  style={{
                    backgroundColor: "#fef3c7",
                    color: "#b45309",
                    padding: "3px 8px",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    fontSize: "11px",
                  }}
                >
                  🏷️ Class: {issue.class || "-"}
                </span>
              </div>

              {/* Title */}
              <h3 style={{ margin: "4px 0", fontSize: "16px", color: "#0f172a" }}>{issue.title}</h3>

              {/* Description */}
              <div style={{ backgroundColor: "#f8fafc", padding: "10px", borderRadius: "6px", fontSize: "13px", color: "#334155" }}>
                📝 <strong>Desc:</strong> {issue.description || "-"}
              </div>

              {/* Details List */}
              <div style={{ fontSize: "13px", color: "#334155", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div>👥 <strong>Group:</strong> {issue.group || "-"}</div>
                <div>👤 <strong>Name:</strong> {issue.created_by || "-"}</div>
                <div>📍 <strong>Location:</strong> {issue.location || "-"}</div>
                <div>👤 <strong>PIC:</strong> {issue.pic || "-"}</div>

                {/* EDITABLE EST. CLOSING SECTION */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                  <span>🎯 <strong>Est. Closing:</strong></span>
                  {editingClosingId === issue.id ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <input
                        type="date"
                        value={newClosingDate}
                        onChange={(e) => setNewClosingDate(e.target.value)}
                        style={{ padding: "3px 6px", fontSize: "12px", borderRadius: "4px", border: "1px solid #0284c7" }}
                      />
                      <button
                        onClick={() => handleUpdateClosingDate(issue.id)}
                        style={{ backgroundColor: "#0284c7", color: "#fff", border: "none", borderRadius: "4px", padding: "3px 8px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingClosingId(null)}
                        style={{ backgroundColor: "#e2e8f0", color: "#475569", border: "none", borderRadius: "4px", padding: "3px 6px", fontSize: "11px", cursor: "pointer" }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontWeight: "600", color: "#0c4a6e" }}>{issue.target_due_date || "-"}</span>
                      <button
                        onClick={() => {
                          setEditingClosingId(issue.id);
                          setNewClosingDate(issue.target_due_date || "");
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "13px",
                          padding: "0 2px",
                        }}
                        title="Edit Target Due Date"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}