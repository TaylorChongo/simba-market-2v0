import React, { useState, useEffect } from 'react';
import Button from '../Button';
import Input from '../Input';
import { API_URL } from '../../lib/utils';

const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateSetting = async (key, value) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/admin/settings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ key, value })
      });
      fetchSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const handleAddSetting = async (e) => {
    e.preventDefault();
    await handleUpdateSetting(newKey, newValue);
    setNewKey('');
    setNewValue('');
  };

  return (
    <div className="bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm">
      <h2 className="text-xl font-bold mb-4">System Settings</h2>
      
      <form onSubmit={handleAddSetting} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-surface-variant/20 rounded-xl">
        <Input 
          placeholder="Setting Key (e.g. MAINTENANCE_MODE)" 
          value={newKey} 
          onChange={(e) => setNewKey(e.target.value)}
          required
        />
        <Input 
          placeholder="Value" 
          value={newValue} 
          onChange={(e) => setNewValue(e.target.value)}
          required
        />
        <Button type="submit">Add/Update Setting</Button>
      </form>

      <div className="space-y-4">
        {settings.map(setting => (
          <div key={setting.id} className="flex items-center justify-between p-4 border border-outline-variant rounded-xl">
            <div>
              <p className="font-bold text-sm uppercase text-on-surface-variant">{setting.key}</p>
              <p className="text-lg">{setting.value}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const val = prompt('Enter new value:', setting.value);
                if (val !== null) handleUpdateSetting(setting.key, val);
              }}
            >
              Edit
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemSettings;
