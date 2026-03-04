import { useRef, useState } from "react";

export default function LogMeeting({ navigate }) {
  const [mode,      setMode]      = useState("photo");    // photo | text
  const [file,      setFile]      = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [text,      setText]      = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [dragOver,  setDragOver]  = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const handleProcess = async () => {
    if (mode === "photo" && !file) { setError("Please upload a photo first."); return; }
    if (mode === "text"  && !text.trim()) { setError("Please enter your meeting notes."); return; }

    setLoading(true);
    setError("");

    try {
      let body;
      if (mode === "photo") {
        body = new FormData();
        body.append("image", file);
      } else {
        body = new FormData();
        body.append("text", text);
      }

      const resp = await fetch("/api/meetings/extract", { method: "POST", body });
      const data = await resp.json();

      if (!resp.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      navigate("review-meeting", { extracted: data.extracted, imagePreview: preview });
    } catch (e) {
      setError("Could not reach the server. Make sure SalesSaathi is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "32px", maxWidth: "680px" }}>
      <button onClick={() => navigate("dashboard")} style={backBtn}>← Dashboard</button>

      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "22px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
        Log a Meeting
      </h1>
      <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
        Upload a photo of your handwritten notes, or type them directly.
      </p>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {[["photo", "📸 Photo of notes"], ["text", "✏️ Type notes"]].map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
            padding: "9px 18px", borderRadius: "8px", cursor: "pointer",
            border: `2px solid ${mode === m ? "#1d4ed8" : "#e2e8f0"}`,
            background: mode === m ? "#eff6ff" : "#fff",
            color: mode === m ? "#1d4ed8" : "#475569",
            fontSize: "13.5px", fontWeight: mode === m ? 600 : 400,
          }}>{label}</button>
        ))}
      </div>

      {mode === "photo" ? (
        <>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? "#1d4ed8" : preview ? "#86efac" : "#cbd5e1"}`,
              borderRadius: "14px",
              background: dragOver ? "#eff6ff" : preview ? "#f0fdf4" : "#fafafa",
              minHeight: "260px",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              cursor: "pointer", marginBottom: "16px", overflow: "hidden",
              transition: "all 0.15s",
            }}>
            {preview ? (
              <img src={preview} alt="Notes" style={{ maxWidth: "100%", maxHeight: "360px", objectFit: "contain", borderRadius: "8px" }} />
            ) : (
              <>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>📷</div>
                <div style={{ fontWeight: 600, color: "#475569", marginBottom: "4px" }}>Click or drag a photo here</div>
                <div style={{ fontSize: "13px", color: "#94a3b8" }}>JPG, PNG, HEIC — any photo of handwritten notes</div>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => handleFile(e.target.files[0])} />

          {preview && (
            <button onClick={() => { setFile(null); setPreview(null); }} style={{
              background: "none", border: "none", color: "#94a3b8", fontSize: "13px",
              cursor: "pointer", marginBottom: "16px",
            }}>✕ Remove photo</button>
          )}
        </>
      ) : (
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`Write your meeting notes here…\n\nClient: Ramesh Patil, Patil Auto Parts, 9823XXXXXX\nDiscussed: 50-unit order of spare parts\nConcern: delivery timeline\nFollow-up: March 12`}
          style={{
            width: "100%", minHeight: "260px", padding: "16px",
            border: "1.5px solid #e2e8f0", borderRadius: "12px",
            fontSize: "14px", lineHeight: 1.7, color: "#1e293b",
            fontFamily: "'Inter', sans-serif", resize: "vertical",
            outline: "none", marginBottom: "16px", boxSizing: "border-box",
          }}
        />
      )}

      {error && (
        <div style={{ background: "#fee2e2", borderRadius: "10px", padding: "12px 16px",
          marginBottom: "16px", color: "#991b1b", fontSize: "13.5px" }}>
          {error}
        </div>
      )}

      <div style={{
        background: "#f0f9ff", borderRadius: "10px", padding: "12px 16px",
        border: "1px solid #bae6fd", marginBottom: "20px",
      }}>
        <div style={{ fontSize: "13px", color: "#0369a1" }}>
          <strong>🤖 Powered by Gemini AI.</strong> Your notes are sent to Google's AI for extraction —
          nothing is stored by Google beyond the processing request.
        </div>
      </div>

      <button onClick={handleProcess} disabled={loading} style={{
        width: "100%", padding: "14px",
        background: loading ? "#93c5fd" : "linear-gradient(135deg, #1d4ed8, #3b82f6)",
        color: "#fff", border: "none", borderRadius: "10px",
        fontSize: "15px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
      }}>
        {loading ? "🤖 AI is reading your notes… (10–20 seconds)" : "Process with AI →"}
      </button>
    </div>
  );
}

const backBtn = {
  background: "none", border: "none", color: "#64748b",
  fontSize: "13px", cursor: "pointer", padding: "0 0 20px",
  display: "flex", alignItems: "center", gap: "4px",
};
