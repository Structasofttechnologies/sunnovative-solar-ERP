import { useEffect, useState } from 'react';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import epcApi from '../../../api/epcApi';

const EpcMyPlan = () => {
  const { epc, updateEpcData } = useEpcAuth();
  const [plans, setPlans]     = useState([]);
  const [myPlan, setMyPlan]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const [plansRes, myRes] = await Promise.all([
          epcApi.get('/api/epc/plans'),
          epcApi.get('/api/epc/plans/my-plan'),
        ]);
        setPlans(plansRes.data);
        setMyPlan(myRes.data);
      } catch (error) {
        console.error('Plans fetch error:', error);
      } finally { setLoading(false); }
    };
    fetchPlans();
  }, []);

  const handleUpgrade = async (planName, billing) => {
    if (!window.confirm(`Upgrade to ${planName} (${billing})?`)) return;
    setUpgrading(planName + billing);
    try {
      const { data } = await epcApi.post('/api/epc/plans/upgrade', {
        newPlan: planName, billingCycle: billing,
      });
      setMsg({ text: `Upgraded to ${planName}!`, type: 'success' });
      updateEpcData({ plan: data.plan });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Upgrade failed', type: 'error' });
    } finally {
      setUpgrading('');
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    }
  };

  const planConfig = {
    Standard: {
      icon: '⭐',
      accent: 'border-gray-200',
      header: 'bg-gray-50',
      text:   'text-gray-700',
      btn:    'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300',
      ring:   '',
    },
    Professional: {
      icon: '🔷',
      accent: 'border-blue-200',
      header: 'bg-blue-50',
      text:   'text-blue-700',
      btn:    'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
      ring:   'ring-2 ring-blue-200',
    },
    Enterprise: {
      icon: '👑',
      accent: 'border-purple-200',
      header: 'bg-purple-50',
      text:   'text-purple-700',
      btn:    'bg-purple-600 hover:bg-purple-700 text-white border-purple-600',
      ring:   '',
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-800 text-xl font-bold">My Plan</h2>
        <p className="text-gray-500 text-sm mt-0.5">View and upgrade your EPC partner plan</p>
      </div>

      {msg.text && (
        <div className={`text-sm rounded-lg px-4 py-3 border ${
          msg.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>{msg.text}</div>
      )}

      {/* Current plan card */}
      {myPlan && (
        <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{planConfig[myPlan.currentPlan]?.icon}</span>
            <div>
              <p className="text-gray-800 font-bold text-lg">{myPlan.currentPlan} Plan</p>
              <p className="text-gray-400 text-xs">
                {myPlan.planExpiresAt
                  ? `Expires: ${new Date(myPlan.planExpiresAt).toLocaleDateString('en-IN')}`
                  : 'No expiry set'}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-yellow-600 text-sm font-semibold">{myPlan.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-gray-400 text-xs">({myPlan.totalRatings} ratings)</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(myPlan.activeDistricts || []).map(d => (
              <span key={d} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200">{d}</span>
            ))}
            {!myPlan.activeDistricts?.length && (
              <span className="text-gray-400 text-xs">No active districts yet — contact admin</span>
            )}
          </div>
        </div>
      )}

      {/* Plan cards */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading plans...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map(plan => {
            const cfg = planConfig[plan.name] || planConfig.Standard;
            const isCurrent = epc?.plan === plan.name;
            return (
              <div key={plan.name}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${cfg.accent} ${isCurrent ? cfg.ring : 'hover:shadow-md'}`}>
                <div className={`px-5 py-4 ${cfg.header}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cfg.icon}</span>
                    <div>
                      <p className={`font-bold text-base ${cfg.text}`}>{plan.name}</p>
                      <p className="text-gray-500 text-xs">{plan.loginScope} access</p>
                    </div>
                    {isCurrent && (
                      <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">Current</span>
                    )}
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-gray-400 text-xs">Min Experience</p>
                      <p className="text-gray-700 text-sm font-semibold">{plan.minYearsExperience}+ yrs</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-gray-400 text-xs">Max Districts</p>
                      <p className="text-gray-700 text-sm font-semibold">{plan.maxDistricts}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 col-span-2">
                      <p className="text-gray-400 text-xs">Orders/month</p>
                      <p className="text-gray-700 text-sm font-semibold">{plan.maxOrdersPerMonth}</p>
                    </div>
                  </div>

                  {plan.features?.length > 0 && (
                    <ul className="space-y-1.5">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-600 text-xs">
                          <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  {plan.monthlyFee > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-gray-400 text-xs mb-0.5">Pricing</p>
                      <p className="text-gray-800 text-sm font-bold">₹{plan.monthlyFee?.toLocaleString('en-IN')}/mo</p>
                      {plan.annualFee > 0 && (
                        <p className="text-gray-400 text-xs">₹{plan.annualFee?.toLocaleString('en-IN')}/yr</p>
                      )}
                    </div>
                  )}

                  {!isCurrent && (
                    <div className="flex flex-col gap-2 pt-1">
                      <button onClick={() => handleUpgrade(plan.name, 'Monthly')} disabled={!!upgrading}
                        className={`w-full text-xs font-medium py-2 rounded-lg border transition-colors disabled:opacity-50 ${cfg.btn}`}>
                        {upgrading === plan.name + 'Monthly' ? 'Upgrading...' : 'Monthly'}
                      </button>
                      {plan.annualFee > 0 && (
                        <button onClick={() => handleUpgrade(plan.name, 'Annual')} disabled={!!upgrading}
                          className={`w-full text-xs font-medium py-2 rounded-lg border transition-colors disabled:opacity-50 ${cfg.btn}`}>
                          {upgrading === plan.name + 'Annual' ? 'Upgrading...' : 'Annual (Save more)'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EpcMyPlan;