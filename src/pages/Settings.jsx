import React, { useState, useEffect } from 'react';
import { User, Lock, Save } from 'lucide-react';
import { toast } from 'react-toastify';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  
  // Profile State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profileImage: '',
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token') || '';
    try {
      const response = await fetch(`${apiUrl}/admin/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        setFormData({
          name: result.name || '',
          email: result.email || '',
          profileImage: result.profileImage || ''
        });
      } else {
        toast.error('Failed to load profile details');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token') || '';
    const formDataObj = new FormData();
    formDataObj.append('image', file);

    try {
      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataObj
      });
      
      const result = await response.json();
      if (response.ok) {
        setFormData(prev => ({ ...prev, profileImage: 'http://localhost:5000' + result.image }));
        toast.success('Avatar uploaded! Click Save to apply.');
      } else {
        toast.error(result.message || 'Image upload failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error uploading image');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || '';
    
    try {
      const response = await fetch(`${apiUrl}/admin/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update local storage with new token and details if they were returned
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('admin', JSON.stringify(data));
        }
        toast.success('Profile updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error updating profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    const token = localStorage.getItem('token') || '';
    
    try {
      const response = await fetch(`${apiUrl}/admin/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || 'Password updated successfully!');
        // Clear the password form
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error updating password');
    }
  };

  return (
    <div className="p-4 sm:p-8 relative">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500 mt-1 text-sm">Manage your account settings and preferences.</p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col max-w-4xl">
        {/* Horizontal Tabs */}
        <div className="p-3 border-b border-slate-100 flex flex-row gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 px-6 py-2.5 rounded-xl font-medium transition-colors text-slate-800 whitespace-nowrap ${
              activeTab === 'general' ? 'bg-emerald-50 text-[#0ca356]' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User size={18} />
            General
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-6 py-2.5 rounded-xl font-medium transition-colors text-slate-800 whitespace-nowrap ${
              activeTab === 'security' ? 'bg-emerald-50 text-[#0ca356]' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Lock size={18} />
            Security
          </button>
        </div>

        {/* Content Area */}
        <div>
          {activeTab === 'general' && (
            <div>
              <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">Profile Information</h3>
                <p className="text-sm text-slate-500 mt-1">Update your account's profile information and email address.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                {/* Avatar Placeholder */}
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 mb-10 text-center sm:text-left">
                  <div className="w-24 h-24 shrink-0 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm text-3xl font-bold text-slate-400">
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      formData.name ? formData.name.charAt(0).toUpperCase() : 'A'
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{formData.name || 'Admin'}</h4>
                    <p className="text-sm text-slate-500 mt-0.5 mb-3">{formData.email}</p>
                    <div className="relative overflow-hidden inline-block">
                      <button type="button" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
                        Upload Avatar
                      </button>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Upload Profile Image"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 max-w-xl">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-1 focus:ring-[#0ca356] transition-colors text-slate-800" placeholder="Enter your full name" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-1 focus:ring-[#0ca356] transition-colors text-slate-800" placeholder="Enter your email" />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end max-w-xl">
                  <button type="submit" className="flex items-center gap-2 bg-[#0ca356] hover:bg-[#0a8f4b] text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">Change Password</h3>
                <p className="text-sm text-slate-500 mt-1">Update your password to keep your account secure.</p>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="p-6 sm:p-8">
                <div className="space-y-6 max-w-xl">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                    <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-1 focus:ring-[#0ca356] transition-colors text-slate-800" placeholder="Enter current password" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                    <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-1 focus:ring-[#0ca356] transition-colors text-slate-800" placeholder="Enter new password" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                    <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-1 focus:ring-[#0ca356] transition-colors text-slate-800" placeholder="Confirm new password" />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end max-w-xl">
                  <button type="submit" className="flex items-center gap-2 bg-[#0ca356] hover:bg-[#0a8f4b] text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                    <Lock size={18} />
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
