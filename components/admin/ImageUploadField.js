import { useState } from 'react';
import styles from './ImageUploadField.module.css';

export default function ImageUploadField({ value, onChange, placeholder = 'Paste an image link…' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/uploads', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Upload failed.');
      } else {
        onChange(json.url);
      }
    } catch {
      setError('Upload failed.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className={styles.field}>
      <input type="text" placeholder={placeholder} value={value || ''} onChange={(e) => onChange(e.target.value)} />
      <label className={styles.uploadButton}>
        {uploading ? 'Uploading…' : 'Upload'}
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} hidden />
      </label>
      {error && <span className={styles.error}>{error}</span>}
      {value && <img src={value} alt="" className={styles.preview} />}
    </div>
  );
}
