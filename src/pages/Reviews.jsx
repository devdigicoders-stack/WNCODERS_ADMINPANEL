import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'react-toastify';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/reviews/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        toast.error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Server error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/reviews/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setReviews(reviews.map(review => 
          review._id === id ? { ...review, status: newStatus } : review
        ));
        toast.success(`Review ${newStatus.toLowerCase()} successfully`);
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Server error');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setReviews(reviews.filter(review => review._id !== id));
        toast.success('Review deleted successfully');
      } else {
        toast.error('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Server error');
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || review.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={14} 
            className={i < rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} 
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">Approved</span>;
      case 'Rejected': return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Rejected</span>;
      default: return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">Pending</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#0ca356] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Star className="text-amber-400 fill-amber-400" />
            Reviews & Ratings
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Manage user reviews and testimonials.</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search reviews..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-1 focus:ring-[#0ca356] text-sm transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] text-sm text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">Comment</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <tr key={review._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{review.name}</div>
                      <div className="text-xs text-slate-500">{review.email || 'No email provided'}</div>
                      <div className="text-xs text-slate-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(review.rating)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 line-clamp-3" title={review.comment}>
                        {review.comment}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(review.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {review.status !== 'Approved' && (
                          <button 
                            onClick={() => updateStatus(review._id, 'Approved')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {review.status !== 'Rejected' && (
                          <button 
                            onClick={() => updateStatus(review._id, 'Rejected')}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                        <button 
                          onClick={() => deleteReview(review._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No reviews found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
