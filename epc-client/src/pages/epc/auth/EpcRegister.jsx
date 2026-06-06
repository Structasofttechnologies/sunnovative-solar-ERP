import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import epcApi from '../../../api/epcApi';

const EpcRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    companyName: '',
    ownerName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
    address: '',
    yearsOfExperience: '',
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const nextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.companyName || !form.ownerName || !form.email || !form.mobile) {
        setError('Please fill all fields'); return;
      }
      if (!/^\d{10}$/.test(form.mobile)) {
        setError('Enter valid 10-digit mobile'); return;
      }
    }
    if (step === 2) {
      if (!form.password || !form.confirmPassword) {
        setError('Please fill password fields'); return;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters'); return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match'); return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await epcApi.post('/api/epc/auth/register', {
        companyName:       form.companyName,
        ownerName:         form.ownerName,
        email:             form.email,
        mobile:            form.mobile,
        password:          form.password,
        state:             form.state,
        district:          form.district,
        city:              form.city,
        pincode:           form.pincode,
        address:           form.address,
        yearsOfExperience: Number(form.yearsOfExperience) || 0,
      });
      navigate('/epc/login?registered=1');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const planLabel = () => {
    const y = Number(form.yearsOfExperience);
    if (y >= 5) return { name: 'Enterprise', color: 'text-purple-600', scope: 'State level access' };
    if (y >= 2) return { name: 'Professional', color: 'text-blue-600', scope: 'Cluster level access' };
    return { name: 'Standard', color: 'text-gray-600', scope: 'Single district access' };
  };

  const inputCls = 'w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            </svg>
          </div>
          <h1 className="text-gray-900 text-2xl font-bold">EPC Partner Registration</h1>
          <p className="text-gray-500 text-sm mt-1">Apply to become a Sunnovative EPC partner</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                s < step  ? 'bg-blue-600 text-white' :
                s === step ? 'bg-blue-50 text-blue-600 border border-blue-500' :
                'bg-gray-100 text-gray-400 border border-gray-200'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${s < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Step 1: Company Info */}
          {step === 1 && (
            <form onSubmit={nextStep} className="space-y-4">
              <h2 className="text-gray-900 font-semibold mb-4">Company Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-gray-600 text-xs font-medium mb-1.5">Company Name *</label>
                  <input type="text" value={form.companyName} onChange={set('companyName')}
                    placeholder="ABC Solar Pvt Ltd" className={inputCls} required />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-600 text-xs font-medium mb-1.5">Owner / Contact Person *</label>
                  <input type="text" value={form.ownerName} onChange={set('ownerName')}
                    placeholder="Rajesh Kumar" className={inputCls} required />
                </div>
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={set('email')}
                    placeholder="rajesh@abc.com" className={inputCls} required />
                </div>
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-1.5">Mobile *</label>
                  <input type="tel" value={form.mobile} onChange={set('mobile')}
                    placeholder="9876543210" maxLength={10} className={inputCls} required />
                </div>
              </div>
              <button type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg py-2.5 text-sm mt-2 transition-colors">
                Next →
              </button>
            </form>
          )}

          {/* Step 2: Password + Experience */}
          {step === 2 && (
            <form onSubmit={nextStep} className="space-y-4">
              <h2 className="text-gray-900 font-semibold mb-4">Security & Experience</h2>
              <div>
                <label className="block text-gray-600 text-xs font-medium mb-1.5">Password *</label>
                <input type="password" value={form.password} onChange={set('password')}
                  placeholder="Min 6 characters" className={inputCls} required />
              </div>
              <div>
                <label className="block text-gray-600 text-xs font-medium mb-1.5">Confirm Password *</label>
                <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                  placeholder="Re-enter password" className={inputCls} required />
              </div>
              <div>
                <label className="block text-gray-600 text-xs font-medium mb-1.5">Years of Experience in Solar</label>
                <input type="number" min="0" max="50" value={form.yearsOfExperience}
                  onChange={set('yearsOfExperience')} placeholder="e.g. 3" className={inputCls} />
              </div>

              {/* Auto plan preview */}
              {form.yearsOfExperience !== '' && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">You will be assigned</p>
                    <p className={`text-sm font-semibold ${planLabel().color}`}>
                      {planLabel().name} Plan — {planLabel().scope}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg py-2.5 text-sm transition-colors">
                  ← Back
                </button>
                <button type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg py-2.5 text-sm transition-colors">
                  Next →
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-gray-900 font-semibold mb-4">Location Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-1.5">State</label>
                  <input type="text" value={form.state} onChange={set('state')}
                    placeholder="Gujarat" className={inputCls} />
                </div>
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-1.5">District</label>
                  <input type="text" value={form.district} onChange={set('district')}
                    placeholder="Surat" className={inputCls} />
                </div>
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-1.5">City</label>
                  <input type="text" value={form.city} onChange={set('city')}
                    placeholder="Surat City" className={inputCls} />
                </div>
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-1.5">Pincode</label>
                  <input type="text" value={form.pincode} onChange={set('pincode')}
                    placeholder="395001" maxLength={6} className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-600 text-xs font-medium mb-1.5">Full Address</label>
                  <textarea value={form.address} onChange={set('address')} rows={2}
                    placeholder="Shop/Office address..." className={`${inputCls} resize-none`} />
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setStep(2)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg py-2.5 text-sm transition-colors">
                  ← Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm transition-colors">
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already registered?{' '}
          <Link to="/epc/login" className="text-blue-600 hover:text-blue-500 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default EpcRegister;