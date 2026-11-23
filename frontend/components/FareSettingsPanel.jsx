import { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api/admin/fare-settings';

export default function FareSettingsPanel({ token }) {
  const [settings, setSettings] = useState({
    baseFare: '5',
    pricePerKm: '1',
    minimumFarePercent: '85',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    fetch(API, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'تعذر تحميل إعدادات التعرفة');
        if (active) setSettings({
          baseFare: String(data.baseFare),
          pricePerKm: String(data.pricePerKm),
          minimumFarePercent: String(data.minimumFarePercent),
        });
      })
      .catch((error) => active && setMessage(error.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [token]);

  const update = (field, value) => setSettings((current) => ({ ...current, [field]: value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch(API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          baseFare: Number(settings.baseFare),
          pricePerKm: Number(settings.pricePerKm),
          minimumFarePercent: Number(settings.minimumFarePercent),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'تعذر حفظ الإعدادات');
      setSettings({
        baseFare: String(data.baseFare),
        pricePerKm: String(data.pricePerKm),
        minimumFarePercent: String(data.minimumFarePercent),
      });
      setMessage('تم حفظ إعدادات التعرفة بنجاح');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>جارٍ تحميل إعدادات التعرفة...</p>;

  return (
    <section dir="rtl">
      <h2>إعدادات تسعير الرحلات</h2>
      <p>تُطبّق هذه القيم على طلبات الرحلات الجديدة فقط.</p>
      <form onSubmit={save}>
        <label>
          سعر بداية الرحلة (د.ل)
          <input type="number" min="0" step="0.01" required value={settings.baseFare}
            onChange={(event) => update('baseFare', event.target.value)} />
        </label>
        <label>
          السعر لكل كيلومتر (د.ل)
          <input type="number" min="0" step="0.01" required value={settings.pricePerKm}
            onChange={(event) => update('pricePerKm', event.target.value)} />
        </label>
        <label>
          أقل نسبة مسموحة من السعر المقترح (%)
          <input type="number" min="0" max="100" step="1" required value={settings.minimumFarePercent}
            onChange={(event) => update('minimumFarePercent', event.target.value)} />
        </label>
        <button type="submit" disabled={saving}>{saving ? 'جارٍ الحفظ...' : 'حفظ التعرفة'}</button>
      </form>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
