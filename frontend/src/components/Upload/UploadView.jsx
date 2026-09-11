import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, ShieldAlert } from 'lucide-react';
import { api } from '../../utils/api';

export default function UploadView() {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('GST_REG_06');
  const [bidders, setBidders] = useState([]);
  const [selectedBidderId, setSelectedBidderId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [extractionResult, setExtractionResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getBidders().then(setBidders).catch(console.error);
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('doc_type', docType);
      if (selectedBidderId) {
        formData.append('bidder_id', selectedBidderId);
      }

      const res = await api.uploadDocument(formData);
      setExtractionResult(res);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const parsedData = extractionResult?.extracted_data 
    ? (typeof extractionResult.extracted_data === 'string' ? JSON.parse(extractionResult.extracted_data) : extractionResult.extracted_data)
    : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '24px' }}>
      {/* Upload Box Form */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 className="section-title">Upload Statutory Certificate</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Upload PDF or scanned certificates. Our pipeline applies automated OCR & statutory data extraction with anti-tampering verification.
        </p>

        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              DOCUMENT TYPE
            </label>
            <select 
              value={docType} 
              onChange={(e) => setDocType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
            >
              <option value="GST_REG_06">Form GST REG-06 (Registration Certificate)</option>
              <option value="UDYAM_CERT">Udyam MSME Registration Certificate</option>
              <option value="MCA_COI">MCA21 Certificate of Incorporation</option>
              <option value="PAN_CARD">PAN Card / e-PAN Letter</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              ASSOCIATE TO BIDDER (OPTIONAL)
            </label>
            <select 
              value={selectedBidderId} 
              onChange={(e) => setSelectedBidderId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
            >
              <option value="">-- Standalone Certificate Audit --</option>
              {bidders.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.company_name} ({b.gem_seller_id})
                </option>
              ))}
            </select>
          </div>

          <div 
            style={{
              border: '2px dashed var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              padding: '32px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: file ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
              borderColor: file ? 'var(--primary)' : 'var(--border-glass)'
            }}
            onClick={() => document.getElementById('file-upload-input').click()}
          >
            <input 
              id="file-upload-input" 
              type="file" 
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <UploadCloud size={32} style={{ color: file ? 'var(--primary)' : 'var(--text-muted)', margin: '0 auto 10px' }} />
            {file ? (
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{file.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</div>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Choose a file or drag & drop</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>PDF, PNG, JPG up to 10MB</div>
              </div>
            )}
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={!file || uploading}
            style={{ width: '100%', padding: '12px' }}
          >
            <Sparkles size={16} />
            <span>{uploading ? 'Extracting statutory data...' : 'Run Statutory Extraction'}</span>
          </button>
        </form>
      </div>

      {/* Extraction Results Right Column */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 className="section-title">Extraction & Authenticity Analysis</h3>

        {extractionResult ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-glass)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{extractionResult.file_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Model: <span style={{ color: 'var(--primary)' }}>{extractionResult.extraction_model}</span> • 
                  Confidence: {Math.round(extractionResult.extraction_confidence * 100)}%
                </div>
              </div>
              <span className={`badge ${extractionResult.tampering_suspected ? 'badge-critical' : 'badge-passed'}`}>
                {extractionResult.tampering_suspected ? 'Tampering Flagged' : 'Authentic Layout'}
              </span>
            </div>

            {/* Extracted Statutory Fields */}
            {parsedData && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'var(--bg-app)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Extracted GSTIN</div>
                  <div className="font-mono" style={{ fontWeight: 700, marginTop: '4px' }}>
                    {parsedData.gstin || 'Not found'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-app)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Extracted PAN</div>
                  <div className="font-mono" style={{ fontWeight: 700, marginTop: '4px' }}>
                    {parsedData.pan || 'Not found'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-app)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Legal Business Name</div>
                  <div style={{ fontWeight: 600, marginTop: '4px' }}>
                    {parsedData.legal_name || parsedData.trade_name || 'Not detected'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-app)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Udyam URN / CIN</div>
                  <div className="font-mono" style={{ fontWeight: 600, marginTop: '4px' }}>
                    {parsedData.udyam_reg_number || parsedData.cin || 'N/A'}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '20px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-success)', fontWeight: 600, fontSize: '0.85rem' }}>
                <CheckCircle2 size={16} />
                <span>Statutory Verification Complete</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Document has been verified and registered in the audit database. Key identifiers are matched against Government portal master data.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p>Select and upload a statutory certificate on the left to view parsed data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
