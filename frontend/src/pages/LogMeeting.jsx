import { useRef, useState } from "react";
import { api } from "../services/api";

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

  const handleProcess = async () => {
    if (mode === "photo" && !file) { setError("Please upload a photo first."); return; }
    if (mode === "text" && !text.trim()) { setError("Please enter your meeting notes."); return; }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      if (mode === "photo") {
        formData.append("image", file);
      } else {
        formData.append("text", text);
      }

      const data = await api.meetings.extract(formData);
      navigate("review-meeting", { extracted: data.extracted, imagePreview: preview });
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <button
          onClick={() => navigate("dashboard")}
          style={{ background: 'none', color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          ← Back to Dashboard
        </button>
        <h1 style={{ fontSize: "1.85rem", marginBottom: "0.5rem" }}>Log a Meeting / Lead</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Upload a photo of your handwritten notes or type them out. Our AI will structure the data for you.
        </p>
      </header>

      {/* Mode Toggle */}
      <div className="card" style={{ display: "inline-flex", gap: "0.5rem", padding: "0.5rem", marginBottom: "2.5rem" }}>
        <button
          onClick={() => setMode("photo")}
          style={{
            padding: "0.6rem 1.5rem",
            borderRadius: "8px",
            backgroundColor: mode === "photo" ? "var(--accent-primary)" : "transparent",
            color: mode === "photo" ? "white" : "var(--text-secondary)",
            fontWeight: "500",
            fontSize: "0.9rem"
          }}
        >
          📸 Photo Upload
        </button>
        <button
          onClick={() => setMode("text")}
          style={{
            padding: "0.6rem 1.5rem",
            borderRadius: "8px",
            backgroundColor: mode === "text" ? "var(--accent-primary)" : "transparent",
            color: mode === "text" ? "white" : "var(--text-secondary)",
            fontWeight: "500",
            fontSize: "0.9rem"
          }}
        >
          ✍️ Type Notes
        </button>
      </div>

      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        {mode === "photo" ? (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f && f.type.startsWith("image/")) handleFile(f);
            }}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              borderRadius: '12px',
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: dragOver ? 'var(--bg-secondary)' : 'transparent',
              transition: 'all 0.2s ease',
              overflow: 'hidden'
            }}
          >
            {preview ? (
              <img src={preview} alt="Notes" style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain" }} />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🖼️</span>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Drop your photo here</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Supports JPG, PNG, HEIC</p>
              </div>
            )}
            <input type="file" ref={inputRef} style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} accept="image/*" />
          </div>
        ) : (
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            style={{
              width: "100%",
              minHeight: "300px",
              padding: "1.5rem",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              outline: "none",
              fontFamily: "inherit",
              fontSize: "1rem",
              resize: 'vertical',
              backgroundColor: 'var(--bg-secondary)'
            }}
            placeholder="Type your notes here... e.g. Met with Anil from Tata Motors regarding new membership. Interested in HR services."
          />
        )}
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.9rem' }}>
          <strong>Oops:</strong> {error}
        </div>
      )}

      <button
        className="btn-primary"
        style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}
        disabled={loading}
        onClick={handleProcess}
      >
        {loading ? "AI is processing your notes..." : "🚀 Let AI Analyze My Notes"}
      </button>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Powered by Google Gemini 1.5 Pro
      </p>
    </div>
  );
}
