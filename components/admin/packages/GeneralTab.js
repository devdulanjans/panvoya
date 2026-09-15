import { useState } from 'react';
import ImageUploadField from '../ImageUploadField';
import GalleryField from '../GalleryField';
import RichTextEditor from '../RichTextEditor';
import { CATEGORY_OPTIONS, STATUS_OPTIONS, CURRENCY_OPTIONS, TRIP_LENGTH_OPTIONS } from '../../../lib/packageSchema';
import { slugify } from '../../../lib/slug';
import styles from './PackageEditor.module.css';

export default function GeneralTab({ value, onChange, existingTourAreas = [] }) {
  const [slugTouched, setSlugTouched] = useState(Boolean(value.slug));
  const set = (field, fieldValue) => onChange({ ...value, [field]: fieldValue });

  const handleTitleChange = (title) => {
    const next = { ...value, title };
    if (!slugTouched) next.slug = slugify(title);
    onChange(next);
  };

  const handleSlugChange = (slug) => {
    setSlugTouched(true);
    set('slug', slug);
  };

  const toggleCurrency = (currency) => {
    const current = value.currency || [];
    const next = current.includes(currency) ? current.filter((c) => c !== currency) : [...current, currency];
    set('currency', next);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.grid}>
        <label className={styles.field}>
          Tour Name
          <input type="text" value={value.title} onChange={(e) => handleTitleChange(e.target.value)} />
        </label>

        <label className={styles.field}>
          URL Slug
          <input
            type="text"
            placeholder="e.g. old-town-discovery-walk"
            value={value.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          Short Name
          <input
            type="text"
            placeholder="e.g. Bali, France, Dubai"
            value={value.shortName}
            onChange={(e) => set('shortName', e.target.value)}
          />
        </label>

        <label className={styles.field}>
          Category
          <select value={value.category} onChange={(e) => set('category', e.target.value)}>
            <option value="" disabled>Select…</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        {value.category === 'Outbound' && (
          <label className={styles.field}>
            Tour Area
            <input
              type="text"
              list="tour-area-options"
              placeholder="e.g. Europe Tour, West Asia"
              value={value.tourArea}
              onChange={(e) => set('tourArea', e.target.value)}
            />
            <datalist id="tour-area-options">
              {existingTourAreas.map((area) => (
                <option key={area} value={area} />
              ))}
            </datalist>
          </label>
        )}

        <label className={styles.field}>
          Trip Length
          <select value={value.tripLength} onChange={(e) => set('tripLength', e.target.value)}>
            <option value="" disabled>Select…</option>
            {TRIP_LENGTH_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          Duration
          <input type="text" placeholder="e.g. 5 Days / 4 Nights" value={value.duration} onChange={(e) => set('duration', e.target.value)} />
        </label>

        <label className={styles.field}>
          Status
          <select value={value.status} onChange={(e) => set('status', e.target.value)}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <div className={styles.field}>
          Currency
          <div className={styles.checkboxGroup}>
            {CURRENCY_OPTIONS.map((currency) => (
              <label className={styles.checkboxOption} key={currency}>
                <input
                  type="checkbox"
                  checked={(value.currency || []).includes(currency)}
                  onChange={() => toggleCurrency(currency)}
                />
                {currency}
              </label>
            ))}
          </div>
        </div>
      </div>

      {value.category === 'Group Tours' && (
        <div className={styles.grid}>
          <label className={styles.field}>
            Minimum Head Count
            <input
              type="text"
              placeholder="e.g. 10"
              value={value.minHeadCount}
              onChange={(e) => set('minHeadCount', e.target.value)}
            />
          </label>

          {(value.currency || []).length === 0 ? (
            <p className={styles.field} style={{ color: '#c0392b' }}>
              Select a currency above to set the price per head.
            </p>
          ) : (
            value.currency.map((currency) => (
              <label className={styles.field} key={currency}>
                Price Per Head ({currency})
                <input
                  type="text"
                  placeholder={currency === 'USD' ? 'e.g. 45.00' : 'e.g. 15000.00'}
                  value={value.groupPricePerHead?.[currency] || ''}
                  onChange={(e) =>
                    set('groupPricePerHead', { ...value.groupPricePerHead, [currency]: e.target.value })
                  }
                />
              </label>
            ))
          )}
        </div>
      )}

      <label className={styles.field}>
        Banner Image
        <ImageUploadField value={value.bannerImage} onChange={(url) => set('bannerImage', url)} />
      </label>

      <label className={styles.field}>
        Map Image
        <ImageUploadField value={value.mapImage} onChange={(url) => set('mapImage', url)} />
      </label>

      <div className={styles.field}>
        Package Gallery
        <GalleryField values={value.gallery} onChange={(gallery) => set('gallery', gallery)} />
      </div>

      <div className={styles.field}>
        Description
        <RichTextEditor value={value.description} onChange={(html) => set('description', html)} />
      </div>
    </div>
  );
}
