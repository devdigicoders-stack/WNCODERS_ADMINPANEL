import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ id: null, name: '', description: '' });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/categories`);
      if (response.ok) {
        const result = await response.json();
        setCategories(result);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching categories');
    }
  };

  const handleAddClick = () => {
    setCurrentCategory({ id: null, name: '', description: '' });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditClick = (category) => {
    setCurrentCategory({ id: category._id, name: category.name, description: category.description });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    const token = localStorage.getItem('token') || '';
    try {
      const response = await fetch(`${apiUrl}/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setCategories(categories.filter(item => item._id !== id));
        toast.success('Category deleted successfully!');
      } else {
        toast.error('Failed to delete category');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting category');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || '';
    
    try {
      let response;
      if (isEditing) {
        // UPDATE
        response = await fetch(`${apiUrl}/categories/${currentCategory.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: currentCategory.name, description: currentCategory.description })
        });
      } else {
        // CREATE
        response = await fetch(`${apiUrl}/categories`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: currentCategory.name, description: currentCategory.description })
        });
      }

      if (response.ok) {
        toast.success(`Category ${isEditing ? 'updated' : 'created'} successfully!`);
        setIsModalOpen(false);
        fetchCategories(); // Refresh list
      } else {
        const err = await response.json();
        toast.error(err.error || 'Failed to save category');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error saving category');
    }
  };

  return (
    <div className="p-4 sm:p-8 relative h-[calc(100vh-80px)] overflow-y-auto bg-slate-50/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">Blog Categories</h2>
          <p className="text-sm text-slate-500 mt-1">Manage categories for your blog posts.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-[#0ca356] hover:bg-[#0a8f4b] text-white px-5 py-2.5 rounded-xl text-sm sm:text-base font-semibold transition-all shadow-sm hover:shadow-md shrink-0"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Category Name</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Slug</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Description</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Date Created</th>
                <th className="py-5 px-6 text-sm font-semibold text-[#1e3b6d] text-center w-[120px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 text-[0.95rem] text-slate-800 font-bold">{category.name}</td>
                  <td className="py-4 px-6 text-sm text-slate-500 font-medium">/{category.slug}</td>
                  <td className="py-4 px-6 text-[0.95rem] text-slate-600 truncate max-w-[300px]">{category.description || '-'}</td>
                  <td className="py-4 px-6 text-[0.95rem] text-slate-500 font-medium">
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleEditClick(category)} className="w-9 h-9 flex items-center justify-center rounded-lg text-[#0ca356] hover:bg-[#e8f6ee] transition-colors" title="Edit">
                        <Edit size={18} strokeWidth={2} />
                      </button>
                      <button onClick={() => handleDelete(category._id)} className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    <p className="text-[0.95rem]">No categories found. Click <strong>Add Category</strong> to create one!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category Name *</label>
                <input 
                  type="text" 
                  value={currentCategory.name} 
                  onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0ca356] focus:ring-2 focus:ring-[#0ca356]/20 transition-all outline-none text-slate-700" 
                  placeholder="e.g. Technology"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description (Optional)</label>
                <textarea 
                  value={currentCategory.description} 
                  onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0ca356] focus:ring-2 focus:ring-[#0ca356]/20 transition-all outline-none text-slate-700 resize-none" 
                  placeholder="Short description about this category"
                  rows="3"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-[#0ca356] text-white font-semibold hover:bg-[#0a8f4b] transition-colors shadow-sm">
                  {isEditing ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Categories;
