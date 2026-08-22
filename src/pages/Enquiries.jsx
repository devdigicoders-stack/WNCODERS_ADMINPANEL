import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'react-toastify';

const getStatusStyle = (status) => {
  switch (status) {
    case 'Pending': return 'text-yellow-600 bg-yellow-50';
    case 'Reviewed': return 'text-emerald-600 bg-emerald-50';
    case 'Resolved': return 'text-emerald-600 bg-emerald-50';
    default: return 'text-slate-600 bg-slate-50';
  }
};

const Enquiries = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', message: '', phoneNumber: '', status: 'Pending' });

  const entriesPerPage = 5;
  const totalPages = Math.ceil(data.length / entriesPerPage);

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = data.slice(indexOfFirstEntry, indexOfLastEntry);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`${apiUrl}/consultations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        toast.error('Failed to fetch enquiries (Check Token)');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching enquiries');
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setModalMode('add');
    setFormData({ fullName: '', message: '', phoneNumber: '', status: 'Pending' });
    setIsModalOpen(true);
  };

  const handleView = (enq) => {
    setModalMode('view');
    setFormData({ fullName: enq.fullName, message: enq.message, phoneNumber: enq.phoneNumber, status: enq.status });
    setIsModalOpen(true);
  };

  const handleEdit = (enq) => {
    setModalMode('edit');
    setSelectedId(enq._id);
    setFormData({ fullName: enq.fullName, message: enq.message, phoneNumber: enq.phoneNumber, status: enq.status });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || '';
    
    try {
      if (modalMode === 'add') {
        const response = await fetch(`${apiUrl}/consultations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            message: formData.message
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          setData([result, ...data]);
          toast.success('Enquiry added successfully!');
        } else {
          toast.error('Failed to add enquiry');
        }
      } else if (modalMode === 'edit') {
        const response = await fetch(`${apiUrl}/consultations/${selectedId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          const result = await response.json();
          setData(data.map(item => item._id === selectedId ? result : item));
          toast.success('Enquiry updated successfully!');
        } else {
          toast.error('Failed to update enquiry');
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Action failed!');
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token') || '';
    try {
      const response = await fetch(`${apiUrl}/consultations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setData(data.filter(item => item._id !== id));
        toast.success('Enquiry deleted successfully!');
        if (currentEntries.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        toast.error('Failed to delete enquiry');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting enquiry');
    }
  };

  return (
    <div className="p-4 sm:p-8 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">Enquiries</h2>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-1.5 sm:gap-2 bg-[#0ca356] hover:bg-[#0a8f4b] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-colors shadow-sm shrink-0"
        >
          <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
          Add Enquiry
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Name</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Message (Email)</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Phone</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Status</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Date</th>
                <th className="py-5 px-6 text-sm font-semibold text-[#1e3b6d] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentEntries.map((enq) => (
                <tr key={enq._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm text-slate-600">{enq.fullName}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{enq.message}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{enq.phoneNumber}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${getStatusStyle(enq.status)}`}>
                      {enq.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </td>
                  <td className="py-4 px-6 flex items-center justify-center gap-4">
                    <button onClick={() => handleView(enq)} className="text-blue-500 hover:text-blue-600 transition-colors" title="View">
                      <Eye size={18} strokeWidth={2} />
                    </button>
                    <button onClick={() => handleEdit(enq)} className="text-[#0ca356] hover:text-[#0a8f4b] transition-colors" title="Edit">
                      <Edit size={18} strokeWidth={2} />
                    </button>
                    <button onClick={() => handleDelete(enq._id)} className="text-red-500 hover:text-red-600 transition-colors" title="Delete">
                      <Trash2 size={18} strokeWidth={2} />
                    </button>
                  </td>
                </tr>
              ))}
              {currentEntries.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">No enquiries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="py-4 px-6 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500 font-medium">
              Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, data.length)} of {data.length} entries
            </p>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8f9fb8] hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium transition-colors ${
                    currentPage === i + 1 
                      ? 'border border-[#0ca356] text-[#0ca356] bg-[#e8f6ee]' 
                      : 'text-[#4b5a74] hover:bg-slate-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8f9fb8] hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {modalMode === 'add' ? 'Add New Enquiry' : modalMode === 'edit' ? 'Edit Enquiry' : 'View Enquiry'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
                  <input required disabled={modalMode === 'view'} type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-1 focus:ring-[#0ca356] transition-colors disabled:bg-slate-50 disabled:text-slate-500" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message / Info</label>
                  <input required disabled={modalMode === 'view'} type="text" name="message" value={formData.message} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-1 focus:ring-[#0ca356] transition-colors disabled:bg-slate-50 disabled:text-slate-500" placeholder="e.g. Interested in App Dev" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                  <input required disabled={modalMode === 'view'} type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-1 focus:ring-[#0ca356] transition-colors disabled:bg-slate-50 disabled:text-slate-500" placeholder="e.g. +91 9876543210" />
                </div>
                {modalMode === 'edit' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-1 focus:ring-[#0ca356] transition-colors">
                      <option value="Pending">Pending</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="mt-8 flex gap-3">
                {modalMode === 'view' ? (
                  <button type="button" onClick={() => setIsModalOpen(false)} className="w-full px-4 py-2.5 bg-[#0ca356] text-white rounded-lg font-semibold hover:bg-[#0a8f4b] transition-colors">Close</button>
                ) : (
                  <>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-2.5 bg-[#0ca356] text-white rounded-lg font-semibold hover:bg-[#0a8f4b] transition-colors">
                      {modalMode === 'add' ? 'Save Enquiry' : 'Update Enquiry'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Enquiries;
