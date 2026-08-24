import React, { useState, useEffect } from 'react';
import { Save, Megaphone, Link as LinkIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-toastify';

const Announcement = () => {
  const [formData, setFormData] = useState({
    text: '',
    link: '',
    isActive: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  const fetchAnnouncement = async () => {
    try {
      const response = await fetch(`${apiUrl}/announcements`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          text: data.text || '',
          link: data.link || '',
          isActive: data.isActive || false,
        });
      }
    } catch (error) {
      console.error('Error fetching announcement:', error);
      toast.error('Failed to load announcement data');
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const token = localStorage.getItem('token') || '';
    
    try {
      const response = await fetch(`${apiUrl}/announcements`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success('Announcement updated successfully!');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update announcement');
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast.error('Server error while updating announcement');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#0ca356] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 relative">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Megaphone className="text-[#0ca356]" />
          Announcement Bar
        </h2>
        <p className="text-slate-500 mt-1 text-sm">Manage the sticky announcement bar shown at the top of your website.</p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-3xl">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          
          <div className="space-y-6">
            {/* Active Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h4 className="font-semibold text-slate-800">Show Announcement</h4>
                <p className="text-sm text-slate-500">Toggle whether the announcement bar is visible on the website.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isActive" 
                  className="sr-only peer" 
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0ca356]"></div>
              </label>
            </div>

            {/* Announcement Text */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Announcement Text</label>
              <textarea 
                name="text" 
                required 
                rows="3"
                value={formData.text} 
                onChange={handleInputChange} 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-1 focus:ring-[#0ca356] transition-colors text-slate-800 resize-none" 
                placeholder="e.g. 🎉 Get 50% off on all web development services this month!" 
              />
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                Keep the text concise so it fits well on mobile screens.
              </p>
            </div>
            
            {/* Link */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Redirect Link (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <LinkIcon size={18} />
                </div>
                <input 
                  type="text" 
                  name="link" 
                  value={formData.link} 
                  onChange={handleInputChange} 
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-1 focus:ring-[#0ca356] transition-colors text-slate-800" 
                  placeholder="e.g. /contact or https://example.com" 
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Users will be redirected here when they click on the announcement text.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center gap-2 bg-[#0ca356] hover:bg-[#0a8f4b] text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save size={18} />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Announcement;
