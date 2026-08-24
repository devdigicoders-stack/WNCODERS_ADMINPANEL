import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { Editor } from '@tinymce/tinymce-react';

const BlogForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({ 
    title: '', 
    excerpt: '', 
    category: '', 
    author: '', 
    readTime: '5 min read', 
    image: '', 
    content: '',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiUrl.replace(/\/api$/, '');

  useEffect(() => {
    // If in edit mode, try to load data from router state
    if (isEditMode && location.state?.blog) {
      const { blog } = location.state;
      setFormData({
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        category: blog.category || '',
        author: blog.author || '',
        readTime: blog.readTime || '5 min read',
        image: blog.image || '',
        content: blog.content || '',
        tags: blog.tags || []
      });
    } else if (isEditMode) {
      // If no state (e.g. user refreshed the page directly on /edit/:id), they should probably go back 
      // because we don't have a direct GET by ID API.
      toast.warning('Please select a blog from the list to edit.');
      navigate('/dashboard/blog');
    }
  }, [isEditMode, location.state, navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${apiUrl}/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategoriesList(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, [apiUrl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove)
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
        headers: { 'Authorization': `Bearer ${token}` }, // Note: No Content-Type header for FormData, fetch sets it automatically
        body: formDataObj
      });
      
      const result = await response.json();
      if (response.ok) {
        setFormData(prev => ({ ...prev, image: baseUrl + result.image }));
        toast.success('Image uploaded successfully!');
      } else {
        toast.error(result.message || 'Image upload failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error uploading image');
    }
  };

  const handleEditorChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || '';
    
    // Payload already has tags as an array
    const payload = { ...formData };
    
    try {
      if (!isEditMode) {
        const response = await fetch(`${apiUrl}/blogs`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        if (response.ok) {
          toast.success('Blog published successfully!');
          navigate('/dashboard/blog');
        } else {
          toast.error(result.message || 'Failed to add blog');
        }
      } else {
        const response = await fetch(`${apiUrl}/blogs/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        if (response.ok) {
          toast.success('Blog updated successfully!');
          navigate('/dashboard/blog');
        } else {
          toast.error(result.message || 'Failed to update blog');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Action failed!');
    }
  };

  return (
    <div className="p-4 sm:p-8 h-[calc(100vh-80px)] overflow-y-auto flex flex-col bg-slate-50/50">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <button 
          onClick={() => navigate('/dashboard/blog')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isEditMode ? 'Update the details of your blog below.' : 'Fill in the details to publish a new blog.'}
          </p>
        </div>
      </div>

      {/* Main Form */}
      <form id="blog-form" onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Blog Title</label>
            <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem]" placeholder="e.g. The Future of AI in 2026" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
            <select 
              required 
              name="category" 
              value={formData.category} 
              onChange={handleInputChange} 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem] bg-white"
            >
              <option value="" disabled>Select a category</option>
              {categoriesList.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Author</label>
            <input required type="text" name="author" value={formData.author} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem]" placeholder="e.g. John Doe" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tags</label>
            <div className="w-full min-h-[50px] px-3 py-2 rounded-xl border border-slate-200 focus-within:border-[#0ca356] focus-within:ring-4 focus-within:ring-[#0ca356]/10 transition-all bg-white flex flex-wrap gap-2 items-center cursor-text" onClick={() => document.getElementById('tag-input').focus()}>
              {formData.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-[#e8f6ee] text-[#0ca356] text-xs font-bold rounded-lg border border-[#0ca356]/20 flex items-center gap-1.5 shadow-sm">
                  {tag}
                  <button type="button" onClick={() => removeTag(index)} className="hover:bg-[#0ca356]/20 p-0.5 rounded-full transition-colors" title="Remove tag">
                    <X size={12} strokeWidth={3} />
                  </button>
                </span>
              ))}
              <input 
                id="tag-input"
                type="text" 
                value={tagInput} 
                onChange={(e) => setTagInput(e.target.value)} 
                onKeyDown={handleTagKeyDown}
                className="flex-1 outline-none text-[0.95rem] min-w-[120px] bg-transparent" 
                placeholder={formData.tags.length === 0 ? "Type tag and press Enter or Comma..." : ""} 
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Featured Image</label>
            <div className="flex gap-4 items-center">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#e8f6ee] file:text-[#0ca356] hover:file:bg-[#d1ecd9] cursor-pointer" 
              />
              {formData.image && (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            {formData.image && <p className="text-xs text-slate-500 mt-1 truncate">{formData.image}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Short Excerpt</label>
          <textarea required rows="2" name="excerpt" value={formData.excerpt} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0ca356] focus:ring-4 focus:ring-[#0ca356]/10 transition-all text-[0.95rem] resize-none" placeholder="A short description for the blog listing page..."></textarea>
        </div>

        <div className="flex-1 flex flex-col">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Full Content</label>
          <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 min-h-[500px]">
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              value={formData.content}
              onEditorChange={handleEditorChange}
              init={{
                license_key: 'gpl',
                promotion: false,
                height: '100%',
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
                content_style: 'body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:16px }',
                images_upload_handler: async (blobInfo, progress) => {
                  return new Promise(async (resolve, reject) => {
                    const token = localStorage.getItem('token') || '';
                    const formDataObj = new FormData();
                    formDataObj.append('image', blobInfo.blob(), blobInfo.filename());
                    
                    try {
                      const response = await fetch(`${apiUrl}/upload`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formDataObj
                      });
                      
                      const result = await response.json();
                      if (response.ok) {
                        resolve(baseUrl + result.image);
                      } else {
                        reject('Upload failed: ' + result.message);
                      }
                    } catch (error) {
                      reject('HTTP Error: ' + error.message);
                    }
                  });
                }
              }}
            />
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-4 border-t border-slate-100 mt-2 shrink-0">
          <button type="button" onClick={() => navigate('/dashboard/blog')} className="px-8 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            Cancel
          </button>
          <button type="submit" form="blog-form" className="px-8 py-3 bg-[#0ca356] text-white rounded-xl font-bold hover:bg-[#0a8f4b] hover:shadow-md transition-all shadow-sm">
            {isEditMode ? 'Update Blog' : 'Publish Blog'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;
