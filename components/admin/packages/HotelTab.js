import ImageUploadField from '../ImageUploadField';
import GalleryField from '../GalleryField';
import StringListField from '../StringListField';
import { emptyHotel, emptyPriceTier } from '../../../lib/packageSchema';
import styles from './PackageEditor.module.css';

export default function HotelTab({ value, onChange }) {
  const hotels = value.hotels || [];
  const priceTiers = value.priceTiers || [];

  const updateHotel = (index, hotelValue) => {
    const copy = [...hotels];
    copy[index] = hotelValue;
    onChange({ ...value, hotels: copy });
  };

  const removeHotel = (index) => {
    onChange({ ...value, hotels: hotels.filter((_, i) => i !== index) });
  };

  const addHotel = () => {
    onChange({ ...value, hotels: [...hotels, emptyHotel()] });
  };

  const updatePriceTier = (index, tierValue) => {
    const copy = [...priceTiers];
    copy[index] = tierValue;
    onChange({ ...value, priceTiers: copy });
  };

  const removePriceTier = (index) => {
    onChange({ ...value, priceTiers: priceTiers.filter((_, i) => i !== index) });
  };

  const addPriceTier = () => {
    onChange({ ...value, priceTiers: [...priceTiers, emptyPriceTier()] });
  };

  return (
    <div className={styles.panel}>
      <h3 className={styles.sectionTitle}>Hotels</h3>
      <div className={styles.repeaterList}>
        {hotels.map((hotel, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div className={styles.repeaterItem} key={index}>
            <div className={styles.repeaterHeader}>
              <strong>Hotel {index + 1}</strong>
              <button type="button" className={styles.removeItemButton} onClick={() => removeHotel(index)}>
                Remove hotel
              </button>
            </div>

            <div className={styles.grid}>
              <label className={styles.field}>
                Term
                <input type="text" placeholder="e.g. 4-Star" value={hotel.term} onChange={(e) => updateHotel(index, { ...hotel, term: e.target.value })} />
              </label>
              <label className={styles.field}>
                Hotel Name
                <input type="text" value={hotel.hotelName} onChange={(e) => updateHotel(index, { ...hotel, hotelName: e.target.value })} />
              </label>
              <label className={styles.field}>
                Booking Link
                <input type="text" value={hotel.bookingLink} onChange={(e) => updateHotel(index, { ...hotel, bookingLink: e.target.value })} />
              </label>
            </div>

            <label className={styles.field}>
              Featured Image
              <ImageUploadField value={hotel.featuredImage} onChange={(url) => updateHotel(index, { ...hotel, featuredImage: url })} />
            </label>

            <div className={styles.field}>
              Gallery
              <GalleryField values={hotel.gallery} onChange={(gallery) => updateHotel(index, { ...hotel, gallery })} />
            </div>

            <label className={styles.field}>
              Description
              <textarea rows={3} value={hotel.description} onChange={(e) => updateHotel(index, { ...hotel, description: e.target.value })} />
            </label>
          </div>
        ))}
      </div>
      <button type="button" className={styles.addItemButton} onClick={addHotel}>
        + Add hotel
      </button>

      <h3 className={styles.sectionTitle}>Inclusions</h3>
      <StringListField
        values={value.inclusions}
        onChange={(inclusions) => onChange({ ...value, inclusions })}
        placeholder="e.g. Airport transfers"
        addLabel="+ Add inclusion"
      />

      <h3 className={styles.sectionTitle}>Exclusions</h3>
      <StringListField
        values={value.exclusions}
        onChange={(exclusions) => onChange({ ...value, exclusions })}
        placeholder="e.g. International flights"
        addLabel="+ Add exclusion"
      />

      <h3 className={styles.sectionTitle}>Price</h3>
      <div className={styles.repeaterList}>
        {priceTiers.map((tier, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div className={styles.repeaterItem} key={index}>
            <div className={styles.repeaterHeader}>
              <strong>Price {index + 1}</strong>
              <button type="button" className={styles.removeItemButton} onClick={() => removePriceTier(index)}>
                Remove
              </button>
            </div>
            <div className={styles.grid}>
              <label className={styles.field}>
                Type
                <input type="text" placeholder="e.g. Double Occupancy" value={tier.type} onChange={(e) => updatePriceTier(index, { ...tier, type: e.target.value })} />
              </label>
              <label className={styles.field}>
                Pax
                <input type="text" placeholder="e.g. 2" value={tier.pax} onChange={(e) => updatePriceTier(index, { ...tier, pax: e.target.value })} />
              </label>
              {(value.currency || []).length === 0 ? (
                <p className={styles.field} style={{ color: '#c0392b' }}>
                  Select a currency on the General tab to set prices.
                </p>
              ) : (
                value.currency.map((currency) => (
                  <label className={styles.field} key={currency}>
                    Price ({currency})
                    <input
                      type="text"
                      placeholder={currency === 'USD' ? 'e.g. 650.00' : 'e.g. 210000.00'}
                      value={tier.prices?.[currency] || ''}
                      onChange={(e) =>
                        updatePriceTier(index, { ...tier, prices: { ...tier.prices, [currency]: e.target.value } })
                      }
                    />
                  </label>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
      <button type="button" className={styles.addItemButton} onClick={addPriceTier}>
        + Add price
      </button>
    </div>
  );
}
