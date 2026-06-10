import { useEffect, useState } from 'react';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import epcApi from '../../../api/epcApi';

const EpcMyProfile = () => {
  const { epc, updateEpcData } = useEpcAuth();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState({ text: '', type: '' });
  const [form, setForm] = useState({
    companyName: '',
    ownerName:   '',
    mobile:      '',
    state:       '',
    city:        '',
    pincode:     '',
    address:     '',
    hqLocation:  '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await epcApi.get('/api/epc/auth/profile');
      setProfile(data);
      setForm({
        companyName: data.companyName || '',
        ownerName:   data.ownerName   || '',
        mobile:      data.mobile      || '',
        state:       data.state       || '',
        city:        data.city        || '',
        pincode:     data.pincode     || '',
        address:     data.address     || '',
        hqLocation:  data.hqLocation  || '',
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await epcApi.put('/api/epc/auth/profile', form);
      setMsg({ text: 'Profile updated successfully!', type: 'success' });
      updateEpcData({ companyName: data.companyName });
      setEditing(false);
      load();
    } catch (error) {
      setMsg({ text: error.response?.data?.message || 'Update failed', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    }
  };

  const inputCls = 'w-full bg-white border border-gray-300 text-gray-800 placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500';

  const planColors = {
    Standard:     { bg: 'bg-gray-100',    text: 'text-gray-700',   border: 'border-gray-200' },
    Professional: { bg: 'bg-blue-50',     text: 'text-blue-700',   border: 'border-blue-200' },
    Enterprise:   { bg: 'bg-purple-50',   text: 'text-purple-700', border: 'border-purple-200' },
  };

  const planStyle = planColors[profile?.plan] || planColors.Standard;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 text-xl font-bold">My Profile</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Your company profile — shown to customers when selecting EPC partner
          </p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {msg.text && (
        <div className={`text-sm rounded-lg px-4 py-3 border ${
          msg.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>{msg.text}</div>
      )}

      {/* ── Company Header Card ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 text-2xl font-bold">
              {profile?.companyName?.charAt(0)?.toUpperCase() || 'E'}
            </span>
          </div>

          <div className="flex-1">
            <h3 className="text-gray-800 text-xl font-bold">{profile?.companyName}</h3>
            <p className="text-gray-500 text-sm">{profile?.ownerName}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {/* Plan badge */}
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${planStyle.bg} ${planStyle.text} ${planStyle.border}`}>
                {profile?.plan} Plan
              </span>
              {/* Status badge */}
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                profile?.onboardingStatus === 'Verified'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : profile?.onboardingStatus === 'Approved'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-yellow-50 text-yellow-700 border-yellow-200'
              }`}>
                {profile?.onboardingStatus}
              </span>
            </div>
          </div>

          {/* Rating — boss ne kaha: star ratings overall */}
          <div className="flex-shrink-0 text-center bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3">
            <div className="flex items-center gap-1 justify-center mb-1">
              {[1,2,3,4,5].map(s => (
                <svg key={s}
                  className={`w-4 h-4 ${s <= Math.round(profile?.rating || 0) ? 'text-yellow-400' : 'text-gray-200'}`}
                  fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <p className="text-yellow-700 text-lg font-bold">{profile?.rating?.toFixed(1) || '0.0'}</p>
            <p className="text-yellow-600 text-xs">{profile?.totalRatings || 0} ratings</p>
          </div>
        </div>
      </div>

      {/* ── Edit Form ── */}
      {editing ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-gray-700 font-semibold mb-4">Edit Company Information</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 text-xs mb-1">Company Name</label>
                <input type="text" value={form.companyName}
                  onChange={e => setForm({...form, companyName: e.target.value})}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-gray-600 text-xs mb-1">Owner Name</label>
                <input type="text" value={form.ownerName}
                  onChange={e => setForm({...form, ownerName: e.target.value})}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-gray-600 text-xs mb-1">Mobile</label>
                <input type="tel" value={form.mobile}
                  onChange={e => setForm({...form, mobile: e.target.value})}
                  maxLength={10} className={inputCls} />
              </div>
              <div>
                <label className="block text-gray-600 text-xs mb-1">HQ Location</label>
                <input type="text" value={form.hqLocation}
                  onChange={e => setForm({...form, hqLocation: e.target.value})}
                  placeholder="e.g. Surat" className={inputCls} />
              </div>
              <div>
                <label className="block text-gray-600 text-xs mb-1">State</label>
                <input type="text" value={form.state}
                  onChange={e => setForm({...form, state: e.target.value})}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-gray-600 text-xs mb-1">City</label>
                <input type="text" value={form.city}
                  onChange={e => setForm({...form, city: e.target.value})}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-gray-600 text-xs mb-1">Pincode</label>
                <input type="text" value={form.pincode}
                  onChange={e => setForm({...form, pincode: e.target.value})}
                  maxLength={6} className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-600 text-xs mb-1">Address</label>
                <textarea value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  rows={2} className={`${inputCls} resize-none`} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditing(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ── Profile Info View ── */
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-gray-700 text-sm font-semibold mb-3">Contact Info</h3>
            <div className="space-y-2.5">
              <div>
                <p className="text-gray-400 text-xs">Email</p>
                <p className="text-gray-800 text-sm">{profile?.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Mobile</p>
                <p className="text-gray-800 text-sm">{profile?.mobile}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">HQ Location</p>
                <p className="text-gray-800 text-sm">{profile?.hqLocation || '—'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-gray-700 text-sm font-semibold mb-3">Location</h3>
            <div className="space-y-2.5">
              <div>
                <p className="text-gray-400 text-xs">State</p>
                <p className="text-gray-800 text-sm">{profile?.state || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">City</p>
                <p className="text-gray-800 text-sm">{profile?.city || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Address</p>
                <p className="text-gray-800 text-sm">{profile?.address || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Experience & Plan ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-gray-700 text-sm font-semibold mb-3">Experience & Plan</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs mb-1">Experience</p>
            <p className="text-gray-800 text-lg font-bold">{profile?.yearsOfExperience || 0}</p>
            <p className="text-gray-500 text-xs">Years</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs mb-1">Active Districts</p>
            <p className="text-blue-700 text-lg font-bold">{profile?.activeDistricts?.length || 0}</p>
            <p className="text-gray-500 text-xs">Districts</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs mb-1">Overall Rating</p>
            <p className="text-yellow-700 text-lg font-bold">{profile?.rating?.toFixed(1) || '0.0'}</p>
            <p className="text-gray-500 text-xs">{profile?.totalRatings || 0} reviews</p>
          </div>
        </div>

        {/* Active districts list */}
        {profile?.activeDistricts?.length > 0 && (
          <div className="mt-4">
            <p className="text-gray-500 text-xs mb-2">Active Districts:</p>
            <div className="flex gap-2 flex-wrap">
              {profile.activeDistricts.map(d => (
                <span key={d}
                  className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Recent Installation Photos ── */}
      {/* Boss ne kaha: "recent installation photos to be uploaded here" */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700 text-sm font-semibold">
            Recent Installation Photos
          </h3>
          <p className="text-gray-400 text-xs">
            Shown to customers when selecting installer
          </p>
        </div>

        {/* Photos from completed orders */}
        <RecentInstallationPhotos epcId={profile?._id} />
      </div>
    </div>
  );
};

// ── Sub-component: fetch recent installation photos from completed orders ──
const RecentInstallationPhotos = ({ epcId }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const { data } = await epcApi.get('/api/epc/orders?status=Completed');
        const orders = data.orders || data;
        const allPhotos = [];
        orders.forEach(order => {
          if (order.installationPhotos?.length) {
            order.installationPhotos.forEach(photo => {
              allPhotos.push({
                ...photo,
                orderNumber:  order.orderNumber,
                projectType:  order.projectType,
                district:     order.district,
              });
            });
          }
        });
        setPhotos(allPhotos.slice(0, 6)); // max 6 photos
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    if (epcId) fetchPhotos();
  }, [epcId]);

  if (loading) return <p className="text-gray-400 text-sm">Loading photos...</p>;

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-400 text-sm">No installation photos yet</p>
        <p className="text-gray-300 text-xs mt-1">Photos from completed projects will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {photos.map((photo, i) => (
        <div key={i} className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square">
          <img src={photo.fileUrl} alt={photo.caption || 'Installation'}
            className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
            <p className="text-white text-xs truncate">{photo.projectType}</p>
            <p className="text-gray-300 text-xs truncate">{photo.district}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EpcMyProfile;