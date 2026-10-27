import React, { useState, useEffect } from 'react';
import { MedicalDocument } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { apiRequest } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.js';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  X,
  Lock,
  Layers,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Upload Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('LAB_REPORT');

  // OCR Results Modal
  const [inspectedDoc, setInspectedDoc] = useState<MedicalDocument | null>(null);
  const [inspectedLoading, setInspectedLoading] = useState<boolean>(false);

  const fetchDocuments = async () => {
    try {
      const data = await apiRequest<MedicalDocument[]>('/documents');
      setDocuments(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(fetchDocuments, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File exceeds maximum allowable size of 10 MB');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      // Step 1: Request Presigned URL from backend
      const presignedRes = await apiRequest<{
        documentId: string;
        uploadUrl: string;
        s3Key: string;
        isMock: boolean;
      }>('/documents/presigned-url', {
        method: 'POST',
        body: JSON.stringify({
          originalFilename: selectedFile.name,
          contentType: selectedFile.type || 'application/pdf',
          fileSize: selectedFile.size,
          documentType,
        }),
      });

      // Step 2: Upload file binary directly to S3 presigned URL (or local mock endpoint)
      if (presignedRes.isMock) {
        await fetch(presignedRes.uploadUrl, {
          method: 'PUT',
          body: selectedFile,
        });
      } else {
        await fetch(presignedRes.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': selectedFile.type || 'application/pdf',
            'x-amz-server-side-encryption': 'AES256',
          },
          body: selectedFile,
        });
      }

      // Step 3: Confirm upload with backend -> Enqueues to Amazon SQS!
      await apiRequest('/documents/confirm-upload', {
        method: 'POST',
        body: JSON.stringify({
          documentId: presignedRes.documentId,
          s3Key: presignedRes.s3Key,
          fileSizeBytes: selectedFile.size,
        }),
      });

      setUploadSuccess(`"${selectedFile.name}" successfully uploaded directly to Amazon S3 and dispatched to Amazon SQS for background worker processing!`);
      showToast(`Uploaded "${selectedFile.name}" to S3 and queued in SQS!`, 'success');
      setSelectedFile(null);
      fetchDocuments();
    } catch (err: any) {
      setUploadError(err.message || 'Document upload workflow failed');
      showToast(err.message || 'Document upload workflow failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleViewResults = async (docId: string) => {
    try {
      setInspectedLoading(true);
      const doc = await apiRequest<MedicalDocument>(`/documents/${docId}`);
      setInspectedDoc(doc);
    } catch (err: any) {
      alert(err.message || 'Failed to inspect document results');
    } finally {
      setInspectedLoading(false);
    }
  };

  const handleDownload = async (docId: string) => {
    try {
      const res = await apiRequest<{ downloadUrl: string; filename: string }>(`/documents/${docId}/download`);
      window.open(res.downloadUrl, '_blank');
    } catch (err: any) {
      alert(err.message || 'Download failed');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="badge badge-success"><CheckCircle2 size={13} /> Completed</span>;
      case 'PROCESSING':
        return <span className="badge badge-info"><RefreshCw size={13} className="spin" /> Processing</span>;
      case 'QUEUED':
        return <span className="badge badge-warning"><Clock size={13} /> Queued in SQS</span>;
      case 'FAILED':
        return <span className="badge badge-error"><AlertCircle size={13} /> Failed</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.95rem', marginBottom: '0.35rem' }}>Medical Document Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Secure private Amazon S3 document ingestion with decoupled Amazon SQS background worker processing.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="cloud-beacon">
            <span className="beacon-dot" />
            <span>Direct S3 Upload • SigV4 Active</span>
          </span>
        </div>
      </div>

      {/* Upload Box for Patients & Doctors */}
      {user?.role === 'PATIENT' && (
        <div className="card card-featured" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <UploadCloud size={22} color="var(--primary-blue)" />
              <span>Upload Synthetic Medical Document</span>
            </h3>
            <span className="badge badge-info" style={{ fontSize: '0.725rem' }}>
              AES256 Encrypted
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Select a synthetic PDF or image file (Max 10 MB). The browser directly uploads bytes to our private Amazon S3 bucket via cryptographic presigned URL.
          </p>

          {uploadError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--error-bg)',
                border: '1px solid var(--error-border)',
                color: 'var(--error)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--success-bg)',
                border: '1px solid var(--success-border)',
                color: 'var(--success)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              <CheckCircle2 size={18} />
              <span>{uploadSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.45rem' }}>
                  Document Category *
                </label>
                <select
                  className="input-field"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  style={{ height: '44px' }}
                >
                  <option value="LAB_REPORT">Lab Report (Hematology, Lipids)</option>
                  <option value="PRESCRIPTION">Physician Prescription</option>
                  <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                  <option value="INSURANCE">Insurance Document</option>
                  <option value="OTHER">Other Clinical Record</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.45rem' }}>
                  Select File (PDF or Image) *
                </label>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg"
                  className="input-field"
                  onChange={handleFileChange}
                  style={{ height: '44px', padding: '0.5rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <ShieldCheck size={16} color="var(--success)" />
                <span>Zero-knowledge client-side upload directly to AWS S3</span>
              </div>

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.75rem', fontSize: '0.9rem' }}
              >
                {uploading ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    <span>Uploading directly to S3 & Enqueueing...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    <span>Upload & Start OCR Worker</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>Encrypted Document Repository</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Documents stored in private S3 bucket <code>medicloud-prod-documents-531988093771-us-east-1</code>
            </p>
          </div>
          <button onClick={fetchDocuments} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', gap: '0.4rem' }}>
            <RefreshCw size={14} />
            <span>Refresh SQS Queue</span>
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 0', color: 'var(--text-secondary)' }}>
            <RefreshCw size={28} className="spin" color="var(--primary-blue)" style={{ marginBottom: '0.75rem' }} />
            <p>Loading document records...</p>
          </div>
        ) : documents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <FileText size={48} style={{ opacity: 0.25, marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.1rem' }}>No documents uploaded yet</h4>
            <p style={{ fontSize: '0.875rem', marginTop: '0.35rem', color: 'var(--text-muted)' }}>
              Upload a synthetic lab report above to observe real Amazon S3 storage and asynchronous SQS queue extraction.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Category</th>
                  <th>File Size</th>
                  <th>Upload Timestamp</th>
                  <th>Processing Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--primary-subtle)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, display: 'block' }}>{doc.original_filename}</span>
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>ID: {doc.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                        {doc.document_type.toLowerCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{(doc.file_size / 1024).toFixed(1)} KB</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{new Date(doc.uploaded_at).toLocaleString()}</td>
                    <td>{getStatusBadge(doc.processing_status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {doc.processing_status === 'COMPLETED' && (
                          <button
                            onClick={() => handleViewResults(doc.id)}
                            className="btn btn-outline"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', gap: '0.35rem' }}
                            title="View OCR Results"
                          >
                            <Eye size={14} />
                            <span>OCR Insights</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(doc.id)}
                          className="btn btn-outline"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', gap: '0.35rem' }}
                          title="Download S3 Binary"
                        >
                          <Download size={14} />
                          <span>Download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* OCR Results Inspector Modal */}
      {inspectedDoc && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--teal-subtle)', color: 'var(--secondary-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>Document Analysis Results</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Asynchronous Clinical Processing Output</span>
                </div>
              </div>
              <button onClick={() => setInspectedDoc(null)} className="btn btn-outline" style={{ padding: '0.4rem', borderRadius: 'var(--radius-full)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div><strong>File:</strong> {inspectedDoc.original_filename}</div>
              <div><strong>Extraction Engine:</strong> {inspectedDoc.result_metadata?.provider || 'Built-in Clinical OCR Parser (Amazon Textract Compatible)'}</div>
              <div><strong>Completed At:</strong> {inspectedDoc.processed_at ? new Date(inspectedDoc.processed_at).toLocaleString() : 'N/A'}</div>
            </div>

            {/* Extracted Raw OCR Text */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>Extracted Document Content</h4>
              <div
                style={{
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  fontSize: '0.85rem',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-line',
                  lineHeight: 1.6,
                  fontFamily: 'monospace',
                }}
              >
                {inspectedDoc.extracted_text || 'No text extracted.'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
              <button onClick={() => setInspectedDoc(null)} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
