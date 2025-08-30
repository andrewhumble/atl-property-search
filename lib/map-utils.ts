import { PropertyFeature } from "@/types";

export function createPopupContent(feature: PropertyFeature) {
    return `
    <div style="font-family: Arial; font-size: 12px; max-width: 250px;">
      <a href="${feature.properties.gis_url || '#'}" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: bold;">${feature.properties.address}</a><br>
      <div style="height: 6px;"></div>
      <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
        <tbody>
          <tr>
            <td style="font-weight: bold; padding-right: 6px;">Owner:</td>
            <td>${feature.properties.owner_name}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding-right: 6px;">Land:</td>
            <td>$${feature.properties.land_appraised_value?.toLocaleString() || '0'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding-right: 6px;">Total:</td>
            <td>$${feature.properties.total_appraised_value?.toLocaleString() || '0'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding-right: 6px;">Building:</td>
            <td>$${feature.properties.building_appraised_value?.toLocaleString() || '0'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding-right: 6px;">Acres:</td>
            <td>${feature.properties.acres || '0'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding-right: 6px;">County:</td>
            <td>${feature.properties.county}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding-right: 6px;">Last Sale:</td>
            <td>${feature.properties.last_sale_year}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding-right: 6px;">Sqft:</td>
            <td>${feature.properties.sqft || '0'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding-right: 6px;">Bedrooms:</td>
            <td>${feature.properties.bedrooms || '0'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding-right: 6px;">Bathrooms:</td>
            <td>${feature.properties.bathrooms || '0'}</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 6px; display: flex; gap: 8px; align-items: center;">
      <a style="color: #2563eb; text-decoration: underline;" href="https://www.google.com/maps/place/${encodeURIComponent(feature.properties.address)}+Atlanta,+GA" target="_blank">🗺️ Maps</a>
      <a style="color: #2563eb; text-decoration: underline;" href="https://www.google.com/search?q=${encodeURIComponent(feature.properties.address)}+site%3Azillow.com" target="_blank">🏠 Zillow</a>
      ${feature.properties.qpublic_url ? `<a style="color: #2563eb; text-decoration: underline;" href="${feature.properties.qpublic_url}" target="_blank">📋 QPublic</a>` : ''}
      <button type="button" data-parcel-id="${feature.properties.parcel_id}" style="padding: 4px 8px; background-color: #2563eb; color: #fff; border: none; border-radius: 4px; cursor: pointer;" onclick="(async function(el){ try { const id = el.dataset.parcelId; const res = await fetch('/api/saved', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ parcel_id: id }) }); if (!res.ok) { console.error('Save failed', await res.text()); } else { el.style.backgroundColor = '#16a34a'; el.textContent = '✓ Saved'; console.log('Saved parcel', id); } } catch (e) { console.error('Save error', e); } })(this)">💾 Save</button>
      </div>
    </div>
  `
}
