import React, { useState, useEffect } from 'react';
import { API_URL } from '../../lib/utils';

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

  return (
    <div className="bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm">
      <h2 className="text-xl font-bold mb-4">Security Logs</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Details</th>
              <th className="py-3 px-4">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b border-outline-variant hover:bg-surface-variant/10">
                <td className="py-3 px-4 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="py-3 px-4">
                  {log.user ? (
                    <div>
                      <p className="font-bold">{log.user.name}</p>
                      <p className="text-xs text-on-surface-variant">{log.user.email}</p>
                    </div>
                  ) : 'System'}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    log.action.includes('DELETE') ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4">{log.details}</td>
                <td className="py-3 px-4 font-mono text-xs">{log.ip || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SecurityLogs;
