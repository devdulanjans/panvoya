import styles from './PackageEditor.module.css';

export default function SeoTab({ value, onChange }) {
  return (
    <div className={styles.panel}>
      <label className={styles.field}>
        SEO Keywords (comma separated)
        <textarea
          rows={3}
          placeholder="e.g. sri lanka tour, down south package, beach holiday"
          value={value.seoKeywords}
          onChange={(e) => onChange({ ...value, seoKeywords: e.target.value })}
        />
      </label>
    </div>
  );
}
