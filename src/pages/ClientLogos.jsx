import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';

const ClientLogos = () => {
  const [logos, setLogos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLogo, setCurrentLogo] = useState({ name: '', imageUrl: '' });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiUrl.replace(/\/api$/, '');

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const response = await fetch(`${apiUrl}/client-logos`);
      if (response.ok) {
        const result = await response.json();
        setLogos(result);
      } else {
        toast.error('Failed to fetch client logos');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching client logos');
    }
  };

  const handleAddClick = () => {
    setCurrentLogo({ name: '', imageUrl: '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client logo?')) return;
    
    const token = localStorage.getItem('token') || '';
    try {
      const response = await fetch(`${apiUrl}/client-logos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setLogos(logos.filter(item => item._id !== id));
        toast.success('Client logo deleted successfully!');
      } else {
        toast.error('Failed to delete client logo');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting client logo');
    }
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
        setCurrentLogo(prev => ({ ...prev, imageUrl: result.image }));
        toast.success('Image uploaded successfully!');
      } else {
        toast.error(result.message || 'Image upload failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error uploading image');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || '';
    
    if (!currentLogo.name || !currentLogo.imageUrl) {
      return toast.error('Please provide a name and upload an image');
    }

    try {
      const response = await fetch(`${apiUrl}/client-logos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: currentLogo.name, imageUrl: currentLogo.imageUrl })
      });

      if (response.ok) {
        toast.success(`Client logo added successfully!`);
        setIsModalOpen(false);
        fetchLogos(); // Refresh list
      } else {
        const err = await response.json();
        toast.error(err.error || 'Failed to save client logo');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error saving client logo');
    }
  };

  return (
    <div className="p-4 sm:p-8 relative h-[calc(100vh-80px)] overflow-y-auto bg-slate-50/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">Client Logos</h2>
          <p className="text-sm text-slate-500 mt-1">Manage the client logos shown on the portfolio page.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-[#0ca356] hover:bg-[#0a8f4b] text-white px-5 py-2.5 rounded-xl text-sm sm:text-base font-semibold transition-all shadow-sm hover:shadow-md shrink-0"
        >
          <Plus size={18} />
          Add Client Logo
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Logo Image</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Client Name</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Date Added</th>
                <th className="py-5 px-6 text-sm font-semibold text-[#1e3b6d] text-center w-[120px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logos.map((logo) => (
                <tr key={logo._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="w-20 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center p-1">
                      <img src={logo.imageUrl.startsWith('http') ? logo.imageUrl : `${baseUrl}${logo.imageUrl}`} alt={logo.name} className="max-w-full max-h-full object-contain" />
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[0.95rem] text-slate-800 font-bold">{logo.name}</td>
                  <td className="py-4 px-6 text-[0.95rem] text-slate-500 font-medium">
                    {logo.createdAt ? new Date(logo.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleDelete(logo._id)} className="w-9 h-9 flex items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors" title="Delete">
                        <Trash2 size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {logos.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500 font-medium">
                    No client logos found. The website is using fallback static images. Add a logo to make it dynamic!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">
                Add Client Logo
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Client Name *</label>
                  <input
                    type="text"
                    value={currentLogo.name}
                    onChange={(e) => setCurrentLogo({...currentLogo, name: e.target.value})}
                    placeholder="e.g. Google, Apple, Airbnb"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0ca356]/20 focus:border-[#0ca356] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Logo Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0ca356]/20 focus:border-[#0ca356] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0ca356]/10 file:text-[#0ca356] hover:file:bg-[#0ca356]/20"
                  />
                  {currentLogo.imageUrl && (
                    <div className="mt-4 p-4 border border-slate-100 rounded-xl bg-slate-50 flex justify-center">
                      <img src={currentLogo.imageUrl.startsWith('http') ? currentLogo.imageUrl : `${baseUrl}${currentLogo.imageUrl}`} alt="Preview" className="max-h-24 object-contain" />
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center gap-3 mt-8 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#0ca356] text-white font-semibold rounded-xl hover:bg-[#0a8f4b] transition-colors shadow-sm hover:shadow-md"
                >
                  Save Logo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientLogos;
