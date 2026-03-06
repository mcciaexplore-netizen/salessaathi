import { useRef, useState } from "react";

export default function LogMeeting({ navigate }) {
  const [mode, setMode] = useState("photo");    // photo | text
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
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
    if (mode === "text" && !text.trim()) { setError("Please enter your meeting notes."); return; }

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
    <div style={{ padding: "48px 40px", maxWidth: "800px", margin: "0 auto" }}>
      <button onClick={() => navigate("dashboard")} style={backBtn}>
        Back to Dashboard
      </button>

      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>Log a Meeting</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>
          Upload a photo of your handwritten notes, or type them directly. Let AI do the data entry.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="glass-card" style={{ display: "inline-flex", gap: "4px", padding: "4px", marginBottom: "32px", borderRadius: "14px" }}>
        {[["photo", "Photo Upload"], ["text", "Write Notes"]].map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
            padding: "10px 24px", borderRadius: "10px", cursor: "pointer",
            background: mode === m ? "var(--accent-blue)" : "transparent",
            color: mode === m ? "#fff" : "var(--text-secondary)",
            fontSize: "14px", fontWeight: mode === m ? 600 : 500,
            transition: "all 0.2s ease",
          }}>{label}</button>
        ))}
      </div>

      {mode === "photo" ? (
        <div style={{ marginBottom: "24px" }}>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className="glass-card"
            style={{
              borderStyle: "dashed",
              borderColor: dragOver ? "var(--accent-blue)" : "var(--border-glass)",
              minHeight: "320px",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              cursor: "pointer", marginBottom: "16px", overflow: "hidden",
              background: dragOver ? "rgba(59, 130, 246, 0.05)" : "var(--bg-glass)",
            }}>
            {preview ? (
              <img src={preview} alt="Notes" style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain" }} />
            ) : (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "18px", marginBottom: "8px" }}>Click or drag a photo here</div>
                <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Supports JPEG, PNG, and HEIC</div>
              </div>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => handleFile(e.target.files[0])} />

          {preview && (
            <button onClick={() => { setFile(null); setPreview(null); }} style={{
              background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", fontSize: "14px",
              cursor: "pointer", marginBottom: "24px", fontWeight: 600, padding: "8px 16px", borderRadius: "8px"
            }}>Remove photo and try another</button>
          )}
        </div>
      ) : (
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`Write your meeting notes here…\n\nClient: Ramesh Patil, Patil Auto Parts\nDiscussed: 50-unit order of spare parts\nConcern: delivery timeline\nFollow-up: March 12`}
          className="glass-card"
          style={{
            width: "100%", minHeight: "320px", padding: "24px",
            fontSize: "16px", lineHeight: 1.6, color: "var(--text-primary)",
            fontFamily: "inherit", resize: "vertical",
            outline: "none", marginBottom: "24px", boxSizing: "border-box",
          }}
        />
      )}

      {error && (
        <div style={{
          background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)",
          borderRadius: "12px", padding: "16px 20px",
          marginBottom: "24px", color: "#fca5a5", fontSize: "14px"
        }}>
          <strong>Wait — </strong> {error}
        </div>
      )}

      <div className="glass-card" style={{
        padding: "16px 24px", marginBottom: "32px",
        background: "rgba(59, 130, 246, 0.05)",
      }}>
        <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          <span style={{ color: "var(--accent-blue)", fontWeight: 700 }}>AI Note Reader</span> <span style={{ opacity: 0.8 }}>uses Gemini Pro to extract structured sales data from your images or text. Privacy first: your notes are only used for this extraction.</span>
        </div>
      </div>

      <button onClick={handleProcess} disabled={loading} className="btn-primary" style={{
        width: "100%", padding: "18px", fontSize: "17px",
        opacity: loading ? 0.7 : 1,
      }}>
        {loading ? "AI is reading your notes... (10-20s)" : "Extract Insights with AI"}
      </button>
    </div>
  );
}

const backBtn = {
  background: "none", border: "none", color: "var(--text-muted)",
  fontSize: "14px", cursor: "pointer", padding: "0 0 24px",
  display: "inline-flex", alignItems: "center", gap: "8px",
  fontWeight: 500,
};
