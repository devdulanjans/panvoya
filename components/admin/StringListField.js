import styles from './StringListField.module.css';

export default function StringListField({ values = [], onChange, placeholder = 'Add an item…', addLabel = '+ Add' }) {
  const updateAt = (index, next) => {
    const copy = [...values];
    copy[index] = next;
    onChange(copy);
  };

  const removeAt = (index) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.list}>
      {values.map((value, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className={styles.row} key={index}>
          <input type="text" value={value} placeholder={placeholder} onChange={(e) => updateAt(index, e.target.value)} />
          <button type="button" className={styles.removeButton} onClick={() => removeAt(index)}>
            ✕
          </button>
        </div>
      ))}
      <button type="button" className={styles.addButton} onClick={() => onChange([...values, ''])}>
        {addLabel}
      </button>
    </div>
  );
}
