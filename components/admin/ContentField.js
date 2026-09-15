import ImageUploadField from './ImageUploadField';
import VideoUploadField from './VideoUploadField';

export default function ContentField({ name, field, value, onChange }) {
  const commonProps = {
    id: `field-${name}`,
    name,
  };

  if (field.type === 'textarea') {
    return (
      <textarea
        {...commonProps}
        rows={4}
        style={{ resize: 'vertical', minHeight: '88px' }}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      />
    );
  }

  if (field.type === 'boolean') {
    return (
      <input
        {...commonProps}
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(name, e.target.checked)}
      />
    );
  }

  if (field.type === 'number') {
    return (
      <input
        {...commonProps}
        type="number"
        value={value}
        min={field.min}
        max={field.max}
        onChange={(e) => onChange(name, Number(e.target.value))}
      />
    );
  }

  if (field.type === 'select') {
    return (
      <select {...commonProps} value={value} onChange={(e) => onChange(name, e.target.value)}>
        <option value="" disabled>
          Select…
        </option>
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'url') {
    return <ImageUploadField value={value} onChange={(url) => onChange(name, url)} />;
  }

  if (field.type === 'link') {
    return (
      <input
        {...commonProps}
        type="url"
        placeholder="https://…"
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      />
    );
  }

  if (field.type === 'video') {
    return <VideoUploadField value={value} onChange={(url) => onChange(name, url)} />;
  }

  return (
    <input
      {...commonProps}
      type="text"
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
    />
  );
}
