import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'react-toastify';

const Projects = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit'
  const [selectedId, setSelectedId] = useState(null);
  
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    imageUrl: '', 
    projectLink: '',
    status: 'In Progress',
    category: 'Web Development',
    technologies: '' // string representation for input
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiUrl.replace(/\/api$/, '');

  const entriesPerPage = 6;
  const totalPages = Math.ceil(data.length / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = data.slice(indexOfFirstEntry, indexOfLastEntry);

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/categories`);
      if (response.ok) {
        const result = await response.json();
        setCategories(result);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${apiUrl}/projects`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        toast.error('Failed to fetch projects');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching projects');
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
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
        setFormData(prev => ({ ...prev, imageUrl: baseUrl + result.image }));
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
      title: '', 
      description: '', 
      imageUrl: '', 
      projectLink: '', 
      status: 'In Progress', 
      category: categories.length > 0 ? categories[0].name : '', 
      technologies: '' 
    });
    setShowForm(true);
  };

  const handleEdit = (proj) => {
    setModalMode('edit');
    setSelectedId(proj._id);
    setFormData({ 
      title: proj.title, 
      description: proj.description, 
      imageUrl: proj.imageUrl, 
      projectLink: proj.projectLink,
      status: proj.status || 'In Progress',
      category: proj.category || 'Web Development',
      technologies: proj.technologies ? proj.technologies.join(', ') : ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || '';
    
    // Convert comma-separated string to array
    const techArray = formData.technologies.split(',').map(tech => tech.trim()).filter(tech => tech !== '');

    const payload = {
      ...formData,
      technologies: techArray
    };

    try {
      let response;
      if (modalMode === 'add') {
        response = await fetch(`${apiUrl}/projects`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${apiUrl}/projects/${selectedId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        toast.success(`Project ${modalMode === 'add' ? 'added' : 'updated'} successfully!`);
        fetchProjects();
        setShowForm(false);
      } else {
        const result = await response.json();
        toast.error(result.message || 'Failed to save project');
      }
    } catch (error) {
      console.error(error);
      toast.error('Action failed!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    const token = localStorage.getItem('token') || '';
    try {
      const response = await fetch(`${apiUrl}/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('Project deleted successfully!');
        fetchProjects();
        if (currentEntries.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        toast.error('Failed to delete project');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting project');
    }
  };

  return (
    <div className="p-4 sm:p-8 relative h-[calc(100vh-80px)] overflow-y-auto bg-slate-50/50">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">Portfolio Projects</h2>
          <p className="text-sm text-slate-500 mt-1">Manage WNCoders portfolio projects and case studies.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-[#0ca356] hover:bg-[#0a8f4b] text-white px-5 py-2.5 rounded-xl text-sm sm:text-base font-semibold transition-all shadow-sm hover:shadow-md shrink-0"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Image</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Project Title</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Category</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Status</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Technologies</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Project Link</th>
                <th className="py-5 px-6 text-sm font-semibold text-slate-700">Date Added</th>
                <th className="py-5 px-6 text-sm font-semibold text-[#1e3b6d] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentEntries.map((proj) => (
                <tr key={proj._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                      {proj.imageUrl ? (
                        <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">No Img</div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[0.95rem] text-slate-800 font-bold max-w-[200px] truncate">{proj.title}</td>
                  <td className="py-4 px-6 text-[0.95rem] text-slate-600 font-medium">
                    {proj.category || 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-[0.95rem]">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                      proj.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      proj.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {proj.status || 'In Progress'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[0.95rem] text-slate-600 font-medium">
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies && proj.technologies.slice(0, 3).map((tech, i) => (
                        <span key={i} className="px-2 py-0.5 text-xs font-bold rounded bg-slate-100 border border-slate-200">{tech}</span>
                      ))}
                      {proj.technologies && proj.technologies.length > 3 && (
                        <span className="px-2 py-0.5 text-xs font-bold rounded bg-slate-100 border border-slate-200">+{proj.technologies.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[0.95rem] text-slate-600 font-medium max-w-[150px] truncate">
                    <a href={proj.projectLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{proj.projectLink}</a>
                  </td>
                  <td className="py-4 px-6 text-[0.95rem] text-slate-500 font-medium">
                    {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleEdit(proj)} className="w-9 h-9 flex items-center justify-center rounded-lg text-[#0ca356] hover:bg-[#e8f6ee] transition-colors" title="Edit">
                        <Edit size={18} strokeWidth={2} />
                      </button>
                      <button onClick={() => handleDelete(proj._id)} className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentEntries.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <p className="text-[0.95rem]">No projects found. Add your first project!</p>
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
                <h3 className="text-xl font-bold text-slate-800">{modalMode === 'add' ? 'Add New Project' : 'Edit Project'}</h3>
                <p className="text-sm text-slate-500 mt-1">Fill in the details below.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
              <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Project Title *</label>
                  <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem]" placeholder="e.g. Hospital Management System" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Project Image *</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#e8f6ee] file:text-[#0ca356] hover:file:bg-[#d1ecd9] cursor-pointer" 
                    />
                    {formData.imageUrl && (
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  {formData.imageUrl && <p className="text-xs text-slate-500 mt-1 truncate">{formData.imageUrl}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Project Link *</label>
                  <input required type="text" name="projectLink" value={formData.projectLink} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem]" placeholder="e.g. https://github.com/project" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Technologies Used *</label>
                  <input required type="text" name="technologies" value={formData.technologies} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem]" placeholder="e.g. React, Node.js, MongoDB (comma separated)" />
                  <p className="text-xs text-slate-500 mt-1">Separate each technology with a comma</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Project Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem] bg-white">
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))
                    ) : (
                      <option value="">Loading categories...</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Project Status *</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem] bg-white">
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                  <textarea required rows="4" name="description" value={formData.description} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem] resize-none" placeholder="Provide details about the project..."></textarea>
                </div>

              </form>
            </div>

            <div className="p-6 sm:p-8 border-t border-slate-100 shrink-0 bg-white flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="project-form" className="px-8 py-2.5 rounded-xl bg-[#0ca356] text-white font-bold hover:bg-[#0a8f4b] hover:shadow-md transition-all shadow-sm">
                {modalMode === 'add' ? 'Add Project' : 'Save Changes'}
              </button>
            </div>
            
          </div>
        </>
      )}
    </div>
  );
};

export default Projects;
