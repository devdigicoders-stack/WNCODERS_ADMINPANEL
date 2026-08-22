import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'react-toastify';

const TeamMembers = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedId, setSelectedId] = useState(null);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    role: '', 
    description: '', 
    imageUrl: '',
    category: 'Team',
    status: 'Active',
    socialLinks: {
      linkedin: '',
      twitter: '',
      instagram: ''
    }
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const entriesPerPage = 6;
  const totalPages = Math.ceil(data.length / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = data.slice(indexOfFirstEntry, indexOfLastEntry);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`${apiUrl}/team-members`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        toast.error('Failed to fetch team members');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching team members');
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value }
    }));
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
        setFormData(prev => ({ ...prev, imageUrl: 'http://localhost:5000' + result.image }));
        toast.success('Image uploaded successfully!');
      } else {
        toast.error(result.message || 'Image upload failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error uploading image');
    }
  };

  const handleAddClick = () => {
    setModalMode('add');
    setFormData({ 
      name: '', role: '', description: '', imageUrl: '', category: 'Team', status: 'Active', 
      socialLinks: { linkedin: '', twitter: '', instagram: '' }
    });
    setShowForm(true);
  };

  const handleEdit = (member) => {
    setModalMode('edit');
    setSelectedId(member._id);
    setFormData({ 
      name: member.name, 
      role: member.role, 
      description: member.description, 
      imageUrl: member.imageUrl,
      category: member.category || 'Team',
      status: member.status || 'Active',
      socialLinks: {
        linkedin: member.socialLinks?.linkedin || '',
        twitter: member.socialLinks?.twitter || '',
        instagram: member.socialLinks?.instagram || ''
      }
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || '';

    try {
      let response;
      if (modalMode === 'add') {
        response = await fetch(`${apiUrl}/team-members`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetch(`${apiUrl}/team-members/${selectedId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(formData)
        });
      }

      if (response.ok) {
        toast.success(`Team member ${modalMode === 'add' ? 'added' : 'updated'} successfully!`);
        fetchTeamMembers();
        setShowForm(false);
      } else {
        const result = await response.json();
        toast.error(result.message || 'Failed to save team member');
      }
    } catch (error) {
      console.error(error);
      toast.error('Action failed!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    
    const token = localStorage.getItem('token') || '';
    try {
      const response = await fetch(`${apiUrl}/team-members/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('Team member removed successfully!');
        fetchTeamMembers();
        if (currentEntries.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        toast.error('Failed to delete team member');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting team member');
    }
  };

  return (
    <div className="p-4 sm:p-8 relative h-[calc(100vh-80px)] overflow-y-auto bg-slate-50/50">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">Team Members</h2>
          <p className="text-sm text-slate-500 mt-1">Manage WNCoders staff and leadership details.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-[#0ca356] hover:bg-[#0a8f4b] text-white px-5 py-2.5 rounded-xl text-sm sm:text-base font-semibold transition-all shadow-sm hover:shadow-md shrink-0"
        >
          <Plus size={18} />
          Add Member
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Photo</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Name & Role</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Category</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Status</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Date Added</th>
                <th className="py-5 px-6 text-sm font-semibold text-[#1e3b6d] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentEntries.map((member) => (
                <tr key={member._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                      {member.imageUrl ? (
                        <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-[0.95rem] text-slate-800 font-bold">{member.name}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{member.role}</p>
                  </td>
                  <td className="py-4 px-6 text-[0.95rem] text-slate-600 font-medium">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                      member.category === 'Leadership' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {member.category || 'Team'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[0.95rem]">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                      member.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {member.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[0.95rem] text-slate-500 font-medium">
                    {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleEdit(member)} className="w-9 h-9 flex items-center justify-center rounded-lg text-[#0ca356] hover:bg-[#e8f6ee] transition-colors" title="Edit">
                        <Edit size={18} strokeWidth={2} />
                      </button>
                      <button onClick={() => handleDelete(member._id)} className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentEntries.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <p className="text-[0.95rem]">No team members found. Add your first member!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="py-5 px-6 border-t border-slate-100 flex items-center justify-between bg-white">
            <p className="text-sm text-slate-500 font-medium">
              Showing <span className="text-slate-800 font-semibold">{indexOfFirstEntry + 1}</span> to <span className="text-slate-800 font-semibold">{Math.min(indexOfLastEntry, data.length)}</span> of <span className="text-slate-800 font-semibold">{data.length}</span> entries
            </p>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-slate-200"
              >
                <ChevronLeft size={18} />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold transition-all ${
                    currentPage === i + 1 
                      ? 'border border-[#0ca356] text-[#0ca356] bg-[#e8f6ee] shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-slate-200"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Form */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setShowForm(false)} />
          <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
            
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 shrink-0 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{modalMode === 'add' ? 'Add Team Member' : 'Edit Team Member'}</h3>
                <p className="text-sm text-slate-500 mt-1">Fill in the staff details below.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
              <form id="team-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem]" placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Role/Designation *</label>
                    <input required type="text" name="role" value={formData.role} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem]" placeholder="e.g. Senior Developer" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem] bg-white">
                      <option value="Leadership">Leadership</option>
                      <option value="Team">Team</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Status *</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem] bg-white">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Profile Photo *</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#e8f6ee] file:text-[#0ca356] hover:file:bg-[#d1ecd9] cursor-pointer" 
                    />
                    {formData.imageUrl && (
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 shrink-0">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  {formData.imageUrl && <p className="text-xs text-slate-500 mt-1 truncate">{formData.imageUrl}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Short Description *</label>
                  <textarea required rows="3" name="description" value={formData.description} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem] resize-none" placeholder="Provide a short bio..."></textarea>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-4">Social Links</h4>
                  <div className="space-y-4">
                    <div>
                      <input type="text" name="linkedin" value={formData.socialLinks.linkedin} onChange={handleSocialChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem]" placeholder="LinkedIn URL" />
                    </div>
                    <div>
                      <input type="text" name="twitter" value={formData.socialLinks.twitter} onChange={handleSocialChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem]" placeholder="Twitter / X URL" />
                    </div>
                    <div>
                      <input type="text" name="instagram" value={formData.socialLinks.instagram} onChange={handleSocialChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem]" placeholder="Instagram URL" />
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 sm:p-8 border-t border-slate-100 shrink-0 bg-white flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="team-form" className="px-8 py-2.5 rounded-xl bg-[#0ca356] text-white font-bold hover:bg-[#0a8f4b] hover:shadow-md transition-all shadow-sm">
                {modalMode === 'add' ? 'Add Member' : 'Save Changes'}
              </button>
            </div>
            
          </div>
        </>
      )}
    </div>
  );
};

export default TeamMembers;
