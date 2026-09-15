import ImageUploadField from '../ImageUploadField';
import StringListField from '../StringListField';
import { emptyItineraryDay } from '../../../lib/packageSchema';
import styles from './PackageEditor.module.css';

export default function ItineraryTab({ value, onChange }) {
  const days = value.itinerary || [];

  const updateDay = (index, dayValue) => {
    const copy = [...days];
    copy[index] = dayValue;
    onChange({ ...value, itinerary: copy });
  };

  const removeDay = (index) => {
    onChange({ ...value, itinerary: days.filter((_, i) => i !== index) });
  };

  const addDay = () => {
    onChange({ ...value, itinerary: [...days, { ...emptyItineraryDay(), day: `Day ${days.length + 1}` }] });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.repeaterList}>
        {days.map((day, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div className={styles.repeaterItem} key={index}>
            <div className={styles.repeaterHeader}>
              <strong>Day {index + 1}</strong>
              <button type="button" className={styles.removeItemButton} onClick={() => removeDay(index)}>
                Remove day
              </button>
            </div>

            <div className={styles.grid}>
              <label className={styles.field}>
                Day
                <input type="text" value={day.day} onChange={(e) => updateDay(index, { ...day, day: e.target.value })} />
              </label>
              <label className={styles.field}>
                Title
                <input type="text" value={day.title} onChange={(e) => updateDay(index, { ...day, title: e.target.value })} />
              </label>
              <label className={styles.field}>
                Overnight
                <input type="text" placeholder="e.g. Kandy" value={day.overnight} onChange={(e) => updateDay(index, { ...day, overnight: e.target.value })} />
              </label>
            </div>

            <label className={styles.field}>
              Plan Description
              <textarea rows={3} value={day.description} onChange={(e) => updateDay(index, { ...day, description: e.target.value })} />
            </label>

            <div className={styles.field}>
              Activities
              <StringListField
                values={day.activities}
                onChange={(activities) => updateDay(index, { ...day, activities })}
                placeholder="e.g. City tour"
                addLabel="+ Add activity"
              />
            </div>

            <label className={styles.field}>
              Day Image
              <ImageUploadField value={day.image} onChange={(url) => updateDay(index, { ...day, image: url })} />
            </label>
          </div>
        ))}
      </div>

      <button type="button" className={styles.addItemButton} onClick={addDay}>
        + Add day
      </button>
    </div>
  );
}
