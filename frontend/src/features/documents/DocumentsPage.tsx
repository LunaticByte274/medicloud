import React, { useState, useEffect } from 'react';
import { MedicalDocument } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { apiRequest } from '../../lib/api.js';
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
} from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
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
    // Poll for status transitions while any document is in QUEUED or PROCESSING status
    const interval = setInterval(() => {
      fetchDocuments();
    }, 5000);
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
          },
          body: selectedFile,
        });
      }

      // Step 3: Confirm upload with backend -> Enqueues to Amazon SQS!
      await apiRequest('/documents/confirm-upload', {
        method: 'POST',
        body: JSON.stringify({
          documentId: presignedRes.documentId,
        }),
      });

      setUploadSuccess(`"${selectedFile.name}" successfully uploaded and queued for SQS worker processing!`);
      setSelectedFile(null);
      fetchDocuments();
    } catch (err: any) {
      setUploadError(err.message || 'Document upload workflow failed');
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
        return <span className="badge badge-success"><CheckCircle2 size={12} /> Completed</span>;
      case 'PROCESSING':
        return <span className="badge badge-info"><RefreshCw size={12} className="spin" /> Processing</span>;
      case 'QUEUED':
        return <span className="badge badge-warning"><Clock size={12} /> Queued (SQS)</span>;
      case 'FAILED':
        return <span className="badge badge-error"><AlertCircle size={12} /> Failed</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Medical Document Management</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Secure, private Amazon S3 document ingestion with decoupled Amazon SQS asynchronous background processing and Textract OCR extraction.
        </p>
      </div>

      {/* Upload Box for Patients & Doctors */}
      {user?.role === 'PATIENT' && (
        <div className="card" style={{ marginBottom: '2.5rem', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UploadCloud size={20} color="var(--primary-blue)" />
            <span>Upload Synthetic Medical Document</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Supported formats: PDF, PNG, JPG (Max 10 MB). Documents are encrypted at rest with AWS KMS/AES256.
          </p>

          {uploadError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--error-bg)',
                color: 'var(--error)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
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
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              <CheckCircle2 size={18} />
              <span>{uploadSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Document Category *
                </label>
                <select
                  className="input-field"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  <option value="LAB_REPORT">Lab Report (Hematology, Lipids)</option>
                  <option value="PRESCRIPTION">Physician Prescription</option>
                  <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                  <option value="INSURANCE">Insurance Document</option>
                  <option value="OTHER">Other Clinical Record</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Select File *
                </label>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg"
                  className="input-field"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.5rem' }}
              >
                {uploading ? 'Processing S3 Upload & Enqueueing...' : 'Upload & Start Analysis'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.2rem' }}>Encrypted Document Repository</h3>
        <button onClick={fetchDocuments} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
          <RefreshCw size={14} />
          <span>Refresh Queue Status</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
          <p>Loading document records...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem', color: 'var(--text-secondary)' }}>
          <FileText size={42} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No documents uploaded</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Upload a synthetic lab report or prescription to observe SQS asynchronous worker processing.
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <FileText size={18} color="var(--primary-blue)" />
                      <span style={{ fontWeight: 600 }}>{doc.original_filename}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>
                      {doc.document_type.toLowerCase().replace('_', ' ')}
                    </span>
                  </td>
                  <td>{(doc.file_size / 1024).toFixed(1)} KB</td>
                  <td>{new Date(doc.uploaded_at).toLocaleString()}</td>
                  <td>{getStatusBadge(doc.processing_status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {doc.processing_status === 'COMPLETED' && (
                        <button
                          onClick={() => handleViewResults(doc.id)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          title="View OCR Results"
                        >
                          <Eye size={14} />
                          <span>Results</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDownload(doc.id)}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        title="Download Document"
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

      {/* OCR Results Inspector Modal */}
      {inspectedDoc && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="var(--secondary-teal)" />
                <h3 style={{ fontSize: '1.25rem' }}>Document Analysis Results</h3>
              </div>
              <button onClick={() => setInspectedDoc(null)} className="btn btn-outline" style={{ padding: '0.35rem', borderRadius: 'var(--radius-full)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem', padding: '0.75rem', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <div><strong>File:</strong> {inspectedDoc.original_filename}</div>
              <div><strong>Extraction Engine:</strong> {inspectedDoc.result_metadata?.provider || 'Built-in Clinical OCR Parser'}</div>
              <div><strong>Processed At:</strong> {inspectedDoc.processed_at ? new Date(inspectedDoc.processed_at).toLocaleString() : 'N/A'}</div>
            </div>

            {/* Structured Metadata Highlights */}
            {inspectedDoc.result_metadata && Object.keys(inspectedDoc.result_metadata).length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Structured Findings</h4>
                <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.85rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {JSON.stringify(inspectedDoc.result_metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Extracted Raw OCR Text */}
            <div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Extracted Document Text</h4>
              <div
                style={{
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.85rem',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-line',
                  lineHeight: 1.6,
                }}
              >
                {inspectedDoc.extracted_text || 'No text extracted.'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setInspectedDoc(null)} className="btn btn-primary">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
