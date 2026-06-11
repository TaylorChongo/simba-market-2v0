import React, { useState, useEffect } from 'react';
import { API_URL } from '../../lib/utils';
import { 
  Users, 
  ShoppingBag, 
  Package, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  ArrowUpRight,
  Clock,
  Calendar,
  ChevronDown
} from 'lucide-react';

const SystemAnalytics = ({ branchName: initialBranchName }) => {
  const [analytics, setAnalytics] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedBranch, setSelectedBranch] = useState(initialBranchName || 'all');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const branchDropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
        setIsBranchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const periods = [
    { id: '7d', label: 'Week' },
    { id: '30d', label: 'Month' },
    { id: '90d', label: '3M' },
    { id: '180d', label: '6M' },
    { id: '1y', label: '1Y' },
    { id: 'custom', label: 'Custom' },
  ];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        let url = `${API_URL}/api/admin/analytics?period=${selectedPeriod}`;
        
        if (selectedPeriod === 'custom' && customRange.start && customRange.end) {
          url += `&startDate=${customRange.start}&endDate=${customRange.end}`;
        }

        if (selectedBranch && selectedBranch !== 'all') {
          url += `&branchName=${encodeURIComponent(selectedBranch)}`;
        }

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    if (selectedPeriod !== 'custom' || (customRange.start && customRange.end)) {
      fetchAnalytics();
    }
  }, [selectedPeriod, customRange, selectedBranch]);

  const handleGenerateReport = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `${API_URL}/api/admin/report?period=${selectedPeriod}`;
      
      if (selectedPeriod === 'custom' && customRange.start && customRange.end) {
        url += `&startDate=${customRange.start}&endDate=${customRange.end}`;
      }

      if (selectedBranch && selectedBranch !== 'all' && selectedBranch !== 'compare') {
        url += `&branchName=${encodeURIComponent(selectedBranch)}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to generate report');

      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      const branchSuffix = selectedBranch && selectedBranch !== 'all' ? `_${selectedBranch.replace(/\s+/g, '_')}` : '';
      const filename = `Simba_Report${branchSuffix}_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(urlBlob);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const actions = [
    { label: 'Generate Period Report', icon: ArrowUpRight, desc: 'CSV of the current selected period', onClick: handleGenerateReport }
  ];

  if (!analytics) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  const stats = [
    { 
      label: 'Total Users', 
      value: analytics.stats.totalUsers, 
      icon: Users, 
      color: 'bg-blue-500/10 text-blue-600',
      trend: analytics.stats.trends.users,
      isPositive: analytics.stats.trends.users.startsWith('+')
    },
    { 
      label: 'Total Orders', 
      value: analytics.stats.totalOrders, 
      icon: ShoppingBag, 
      color: 'bg-primary/10 text-primary',
      trend: analytics.stats.trends.orders,
      isPositive: analytics.stats.trends.orders.startsWith('+')
    },
    { 
      label: 'Total Products', 
      value: analytics.stats.totalProducts, 
      icon: Package, 
      color: 'bg-purple-500/10 text-purple-600',
      trend: analytics.stats.trends.products,
      isPositive: analytics.stats.trends.products.startsWith('+')
    },
    { 
      label: 'Revenue', 
      value: `${analytics.stats.totalRevenue.toLocaleString()} RWF`, 
      icon: DollarSign, 
      color: 'bg-success/10 text-success',
      trend: analytics.stats.trends.revenue,
      isPositive: analytics.stats.trends.revenue.startsWith('+')
    },
  ];

  // Helper for graph visual
  const maxVal = Math.max(...analytics.graphData.map(d => analytics.isCompare ? d.totalCount : d.count), 1);

  // Helper to decide which labels to show
  const shouldShowLabel = (idx, total) => {
    if (total <= 12) return true;
    if (total <= 31) return idx % 5 === 0 || idx === total - 1;
    return idx % (Math.floor(total / 6)) === 0 || idx === total - 1;
  };

  const branchColors = [
    'bg-primary',
    'bg-blue-500',
    'bg-purple-500',
    'bg-amber-500',
    'bg-success',
    'bg-error'
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Branch Selector Dropdown (Admins only) */}
      {!initialBranchName && analytics.availableBranches && (
        <div className="flex flex-wrap items-center gap-4 mb-2">
          <div className="relative" ref={branchDropdownRef}>
            <button 
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="h-11 px-6 rounded-2xl bg-surface border border-outline-variant shadow-sm flex items-center gap-3 hover:border-primary transition-all group"
            >
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] font-black text-outline uppercase tracking-widest">Selected View</span>
                <span className="text-sm font-bold text-on-surface">
                  {selectedBranch === 'all' ? 'All Branches' : 
                   selectedBranch === 'compare' ? 'Branch Comparison' : 
                   selectedBranch.replace('Simba Supermarket ', '')}
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 text-outline transition-transform duration-300 ${isBranchDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isBranchDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-surface border border-outline-variant rounded-2xl shadow-xl py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                <button 
                  onClick={() => { setSelectedBranch('all'); setIsBranchDropdownOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${selectedBranch === 'all' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-high'}`}
                >
                  All Branches
                  {selectedBranch === 'all' && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                </button>
                <button 
                  onClick={() => { setSelectedBranch('compare'); setIsBranchDropdownOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${selectedBranch === 'compare' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-high'}`}
                >
                  Compare Branches (Stacked)
                  {selectedBranch === 'compare' && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                </button>
                <div className="h-px bg-outline-variant/50 my-1" />
                <div className="px-4 py-2 text-[10px] font-black text-outline uppercase tracking-widest">Individual Branches</div>
                {analytics.availableBranches.map((branch) => (
                  <button 
                    key={branch}
                    onClick={() => { setSelectedBranch(branch); setIsBranchDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${selectedBranch === branch ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-high'}`}
                  >
                    {branch.replace('Simba Supermarket ', '')}
                    {selectedBranch === branch && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-6 bg-surface rounded-3xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                stat.isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
              }`}>
                {stat.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-xs text-on-surface-variant font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black tracking-tight">{stat.value}</p>
              <span className="text-[10px] text-on-surface-variant font-bold">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface p-8 rounded-3xl border border-outline-variant shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Activity size={120} />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xl font-black flex items-center gap-2">
                <Activity className="text-primary" />
                System Performance
              </h2>
              <p className="text-sm text-on-surface-variant">Order volume trends across selected period.</p>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className="flex flex-wrap gap-1.5 p-1 bg-surface-variant/20 rounded-2xl relative z-10">
                {periods.map(period => (
                  <button 
                    key={period.id} 
                    onClick={() => {
                      console.log('Period selected:', period.id);
                      setSelectedPeriod(period.id);
                      if (period.id === 'custom') setIsCustomOpen(true);
                      else setIsCustomOpen(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      selectedPeriod === period.id 
                        ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                        : 'text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleGenerateReport}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm shadow-primary/5"
              >
                <ArrowUpRight size={14} />
                Export {periods.find(p => p.id === selectedPeriod)?.label} Data
              </button>
            </div>
          </div>

          {selectedPeriod === 'custom' && isCustomOpen && (
            <div className="mb-8 p-4 bg-surface-variant/10 rounded-2xl border border-outline-variant flex flex-wrap items-end gap-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5">Start Date</label>
                <input 
                  type="date" 
                  value={customRange.start}
                  onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5">End Date</label>
                <input 
                  type="date" 
                  value={customRange.end}
                  onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <button 
                onClick={() => setIsCustomOpen(false)}
                className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-colors"
              >
                Apply Range
              </button>
            </div>
          )}
          
          <div className="h-64 flex flex-col items-end justify-between relative group">
            {/* Real Graph Visual based on data */}
            <div className="absolute inset-0 flex items-end justify-between px-2 gap-1.5 pb-2">
              {analytics.graphData.map((d, i) => (
                <div 
                  key={i} 
                  style={{ height: `${((analytics.isCompare ? d.totalCount : d.count) / maxVal) * 90 + 5}%` }} 
                  className={`flex-1 flex flex-col justify-end rounded-t-md sm:rounded-t-lg transition-all duration-500 relative group/bar ${analytics.isCompare ? 'overflow-hidden' : 'bg-primary/20 group-hover:bg-primary/30'}`}
                >
                  {analytics.isCompare ? (
                    Object.entries(d.branches).map(([branch, data], idx) => (
                      <div 
                        key={branch}
                        style={{ height: `${(data.count / (d.totalCount || 1)) * 100}%` }}
                        className={`${branchColors[idx % branchColors.length]} w-full opacity-70 hover:opacity-100 transition-opacity`}
                        title={`${branch}: ${data.count} orders`}
                      />
                    ))
                  ) : null}

                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] font-bold px-3 py-2 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none shadow-xl z-10 whitespace-nowrap scale-90 group-hover/bar:scale-100 origin-bottom">
                    {analytics.isCompare ? (
                      <div className="flex flex-col gap-1">
                        {Object.entries(d.branches).map(([branch, data], idx) => (
                          <div key={branch} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${branchColors[idx % branchColors.length]}`} />
                            <span className="text-primary-container font-black">{data.count}</span>
                            <span className="opacity-70">{branch.replace('Simba Supermarket ', '')}</span>
                          </div>
                        ))}
                        <div className="h-px bg-white/20 my-1" />
                        <div className="flex justify-between font-black">
                          <span>Total</span>
                          <span>{d.totalCount}</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-primary-container font-black mb-0.5">{d.count} orders</div>
                        <div className="text-[8px] opacity-70">{d.label || d.date}</div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="w-full flex justify-between pt-4 border-t border-outline-variant text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter mt-auto px-1">
              {analytics.graphData.map((d, i) => (
                <span 
                  key={i} 
                  className={`flex-1 text-center transition-opacity duration-300 ${shouldShowLabel(i, analytics.graphData.length) ? 'opacity-100' : 'opacity-0'}`}
                >
                  {d.label 
                    ? (d.label.includes('Week') ? d.label.split('of ')[1] : d.label)
                    : new Date(d.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })
                  }
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface p-8 rounded-3xl border border-outline-variant shadow-sm flex flex-col">
          <h2 className="text-xl font-black mb-6">Quick Actions</h2>
          <div className="space-y-3 flex-1">
            {actions.map((action, i) => (
              <button 
                key={i} 
                onClick={action.onClick}
                className="w-full p-4 rounded-2xl border border-outline-variant hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-lg bg-surface-variant/20 text-on-surface-variant group-hover:text-primary transition-colors">
                    <action.icon size={18} />
                  </div>
                  <span className="font-bold text-sm">{action.label}</span>
                </div>
                <p className="text-xs text-on-surface-variant ml-11">{action.desc}</p>
              </button>
            ))}
          </div>
          <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">System Health</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black italic">Excellent</span>
              <span className="text-xs font-bold">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add ShieldAlert since it's used in the quick actions list
const ShieldAlert = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

export default SystemAnalytics;
