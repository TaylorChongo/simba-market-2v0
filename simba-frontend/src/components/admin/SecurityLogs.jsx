import React, { useState, useEffect } from 'react';
import { API_URL } from '../../lib/utils';
import { 
  ShieldAlert, 
  User, 
  Clock, 
  Globe, 
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Activity
} from 'lucide-react';

const SecurityLogs = () => {
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionStyles = (action) => {
    if (action.includes('DELETE')) return 'bg-error/10 text-error border-error/20';
    if (action.includes('UPDATE')) return 'bg-primary/10 text-primary border-primary/20';
    if (action.includes('CREATE')) return 'bg-success/10 text-success border-success/20';
    return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
  };

  const getActionIcon = (action) => {
    if (action.includes('DELETE')) return <Trash2 size={14} />;
    if (action.includes('UPDATE')) return <Activity size={14} />;
    if (action.includes('CREATE')) return <CheckCircle2 size={14} />;
    return <FileSearch size={14} />;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-surface rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-variant/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="font-black text-on-surface">Security Audit Trail</h3>
              <p className="text-xs text-on-surface-variant">Real-time monitoring of sensitive system actions.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center text-[10px] font-bold">
                  U{i}
                </div>
              ))}
            </div>
            <span className="text-xs text-on-surface-variant font-bold ml-2">Active Admins</span>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-variant/5 border-b border-outline-variant">
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Timestamp</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Actor</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Action Type</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Impact Details</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Network Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-surface-variant/5 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-xs text-on-surface font-medium whitespace-nowrap">
                      <Clock size={14} className="text-on-surface-variant" />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {log.user ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{log.user.name}</p>
                          <p className="text-[10px] text-on-surface-variant">{log.user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs font-black italic text-primary">
                        <AlertTriangle size={14} />
                        SYSTEM
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider border ${getActionStyles(log.action)}`}>
                      {getActionIcon(log.action)}
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-xs text-on-surface-variant max-w-xs truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:max-w-none transition-all">
                      {log.details}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-on-surface-variant bg-surface-variant/20 px-2 py-1 rounded-md w-fit">
                      <Globe size={12} />
                      {log.ip || '0.0.0.0'}
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-on-surface-variant opacity-30">
                      <FileSearch size={64} />
                      <p className="text-sm font-black uppercase tracking-[0.2em]">No security events logged</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-outline-variant bg-surface-variant/5">
          <div className="flex items-center justify-center gap-1">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
              Live updates enabled • encrypted audit trail
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityLogs;
