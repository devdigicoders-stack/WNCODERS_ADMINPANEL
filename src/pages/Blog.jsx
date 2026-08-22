import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Blog = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const entriesPerPage = 5;
  const totalPages = Math.ceil(data.length / entriesPerPage);

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = data.slice(indexOfFirstEntry, indexOfLastEntry);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${apiUrl}/blogs`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        toast.error('Failed to fetch blogs');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching blogs');
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleAddClick = () => {
    navigate('/dashboard/blog/create');
  };

  const handleEdit = (blog) => {
    navigate(`/dashboard/blog/edit/${blog._id}`, { state: { blog } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    
    const token = localStorage.getItem('token') || '';
    try {
      const response = await fetch(`${apiUrl}/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setData(data.filter(item => item._id !== id));
        toast.success('Blog deleted successfully!');
        if (currentEntries.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        toast.error('Failed to delete blog');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting blog');
    }
  };

  return (
    <div className="p-4 sm:p-8 relative h-[calc(100vh-80px)] overflow-y-auto bg-slate-50/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">Blog Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage all your published articles.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-[#0ca356] hover:bg-[#0a8f4b] text-white px-5 py-2.5 rounded-xl text-sm sm:text-base font-semibold transition-all shadow-sm hover:shadow-md shrink-0"
        >
          <Plus size={18} />
          Create Blog
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Image</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Title</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Category</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Author</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Views</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Date</th>
                <th className="py-5 px-6 text-sm font-semibold text-[#1e3b6d] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentEntries.map((blog) => (
                <tr key={blog._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                      {blog.image ? (
                        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Img</div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[0.95rem] text-slate-800 font-bold max-w-[250px] truncate">{blog.title}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    <span className="px-3 py-1.5 text-xs font-bold rounded-lg text-blue-700 bg-blue-50 border border-blue-100">
                      {blog.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[0.95rem] text-slate-600 font-medium">{blog.author}</td>
                  <td className="py-4 px-6 text-[0.95rem] text-slate-600 font-semibold">{blog.views || 0}</td>
                  <td className="py-4 px-6 text-[0.95rem] text-slate-500 font-medium">
                    {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleEdit(blog)} className="w-9 h-9 flex items-center justify-center rounded-lg text-[#0ca356] hover:bg-[#e8f6ee] transition-colors" title="Edit">
                        <Edit size={18} strokeWidth={2} />
                      </button>
                      <button onClick={() => handleDelete(blog._id)} className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentEntries.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <p className="text-[0.95rem]">No blogs found. Click <strong>Create Blog</strong> to publish your first article!</p>
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
    </div>
  );
};

export default Blog;
