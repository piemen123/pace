import { useState } from 'react';
import { UploadCloud, CheckCircle, FileText } from 'lucide-react';
import { extractSyllabus } from '../../services/api';

export const UploadPipeline = () => {
  const [file, setFile] = useState<File | null>(null);
  const [hovering, setHovering] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [data, setData] = useState<any>(null);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setHovering(false);
    if (e.dataTransfer.files.length) setFile(e.dataTransfer.files[0]);
  };

  const doUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    try {
      setData(await extractSyllabus(file));
      setStatus('success');
    } catch {
      setStatus('idle');
      alert('Extraction failed.');
    }
  };

  return (
    <div className="anim-in" style={{ maxWidth: 740 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 750, letterSpacing: '-0.02em' }}>Syllabus AI Pipeline</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginTop: '0.2rem' }}>
          Drop a PDF or image — we'll extract deadlines &amp; exam dates automatically.
        </p>
      </div>

      {!data ? (
        <div
          className={`upload-zone ${hovering ? 'hovering' : ''}`}
          onDragOver={e => { e.preventDefault(); setHovering(true); }}
          onDragLeave={() => setHovering(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('syl-input')?.click()}
        >
          <input
            id="syl-input"
            type="file"
            style={{ display: 'none' }}
            accept=".pdf,image/*"
            onChange={e => e.target.files && setFile(e.target.files[0])}
          />
          <div className="upload-zone-icon">
            <UploadCloud size={24} />
          </div>
          <p className="upload-zone-title">
            {file ? file.name : 'Drag & drop your syllabus here'}
          </p>
          <p className="upload-zone-sub">
            {file ? `${(file.size / 1024).toFixed(1)} KB — ready to extract` : 'Supports PDF and images · click to browse'}
          </p>

          {file && status === 'idle' && (
            <button
              className="btn-primary-ob"
              style={{ marginTop: '1.25rem' }}
              onClick={e => { e.stopPropagation(); doUpload(); }}
            >
              Extract with Vision AI
            </button>
          )}

          {status === 'uploading' && (
            <div style={{ marginTop: '1.25rem', color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 600 }}>
              Parsing with Vision LLM…
            </div>
          )}
        </div>
      ) : (
        <div className="extraction-result">
          <div className="extraction-header">
            <CheckCircle size={22} />
            <h3>Extraction Complete</h3>
          </div>

          <div className="extraction-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <FileText size={15} color="var(--text-3)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{data.course_name}</span>
            </div>

            <div className="extraction-grid">
              <div>
                <p className="extraction-section-label">Exam Dates</p>
                <ul className="extraction-list">
                  {data.exam_dates.map((d: string) => <li key={d}>{d}</li>)}
                </ul>
              </div>
              <div>
                <p className="extraction-section-label">Project Deadlines</p>
                <ul className="extraction-list">
                  {data.project_deadlines.map((p: any) => (
                    <li key={p.name}>{p.name} — {p.date}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <button
            className="btn-ghost"
            style={{ marginTop: '1.25rem' }}
            onClick={() => { setFile(null); setData(null); setStatus('idle'); }}
          >
            Upload Another
          </button>
        </div>
      )}
    </div>
  );
};
