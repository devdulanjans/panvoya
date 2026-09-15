import { useState } from 'react';
import styles from './GalleryField.module.css';

export default function GalleryField({ values = [], onChange }) {
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const removeAt = (index) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const addUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...values, urlInput.trim()]);
    setUrlInput('');
  };

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
        onChange([...values, json.url]);
      }
    } catch {
      setError('Upload failed.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div>
      {values.length > 0 && (
        <div className={styles.grid}>
          {values.map((url, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div className={styles.thumbWrap} key={index}>
              <img src={url} alt="" className={styles.thumb} />
              <button type="button" className={styles.removeButton} onClick={() => removeAt(index)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <div className={styles.addRow}>
        <input
          type="text"
          placeholder="Paste an image link…"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
        />
        <button type="button" className={styles.addButton} onClick={addUrl}>
          Add link
        </button>
        <label className={styles.uploadButton}>
          {uploading ? 'Uploading…' : 'Upload'}
          <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} hidden />
        </label>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
