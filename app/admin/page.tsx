'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, Save } from 'lucide-react';
import { projectsApi, projectImagesApi, teamMembersApi, testimonialsApi, siteSettingsApi, type Project, type TeamMember, type Testimonial } from '@/lib/supabase';
import { uploadImage, deleteImage } from '@/lib/storage';

interface ProjectForm extends Omit<Project, 'id' | 'created_at' | 'updated_at' | 'project_images'> {
  additional_images: string[];
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [projectForm, setProjectForm] = useState<ProjectForm>({
    title: '',
    category: '',
    location: '',
    year: '',
    description: '',
    details: '',
    client: '',
    area: '',
    duration: '',
    featured: false,
    main_image: '',
    additional_images: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsData, teamData, testimonialsData] = await Promise.all([
        projectsApi.getAll(),
        teamMembersApi.getAll(),
        testimonialsApi.getAll()
      ]);
      
      setProjects(projectsData);
      setTeamMembers(teamData);
      setTestimonials(testimonialsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, isMainImage: boolean = false) => {
    if (!file) return;
    
    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      
      if (isMainImage) {
        setProjectForm(prev => ({ ...prev, main_image: imageUrl }));
      } else {
        setProjectForm(prev => ({
          ...prev,
          additional_images: [...prev.additional_images, imageUrl]
        }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeAdditionalImage = (index: number) => {
    setProjectForm(prev => ({
      ...prev,
      additional_images: prev.additional_images.filter((_, i) => i !== index)
    }));
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const projectData = {
        title: projectForm.title,
        category: projectForm.category,
        location: projectForm.location,
        year: projectForm.year,
        description: projectForm.description,
        details: projectForm.details,
        client: projectForm.client,
        area: projectForm.area,
        duration: projectForm.duration,
        featured: projectForm.featured,
        main_image: projectForm.main_image
      };

      let savedProject: Project;
      
      if (editingProject) {
        savedProject = await projectsApi.update(editingProject.id, projectData);
      } else {
        savedProject = await projectsApi.create(projectData);
      }

      // Handle additional images
      if (projectForm.additional_images.length > 0) {
        for (let i = 0; i < projectForm.additional_images.length; i++) {
          await projectImagesApi.create({
            project_id: savedProject.id,
            image_url: projectForm.additional_images[i],
            alt_text: `${savedProject.title} - Image ${i + 2}`,
            sort_order: i + 1
          });
        }
      }

      await loadData();
      setShowProjectForm(false);
      setEditingProject(null);
      resetProjectForm();
      alert(editingProject ? 'Project updated successfully!' : 'Project created successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project. Please try again.');
    }
  };

  const resetProjectForm = () => {
    setProjectForm({
      title: '',
      category: '',
      location: '',
      year: '',
      description: '',
      details: '',
      client: '',
      area: '',
      duration: '',
      featured: false,
      main_image: '',
      additional_images: []
    });
  };

  const editProject = (project: Project) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title,
      category: project.category,
      location: project.location,
      year: project.year,
      description: project.description,
      details: project.details,
      client: project.client,
      area: project.area,
      duration: project.duration,
      featured: project.featured,
      main_image: project.main_image,
      additional_images: project.project_images?.map(img => img.image_url) || []
    });
    setShowProjectForm(true);
  };

  const deleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsApi.delete(id);
        await loadData();
        alert('Project deleted successfully!');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-yellow-400 text-xl">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-light text-yellow-400 mb-2">Admin Panel</h1>
          <p className="text-gray-300">Manage your website content</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-900 p-1 rounded-lg">
          {['projects', 'team', 'testimonials', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-md font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-yellow-400 text-black'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-light text-yellow-400">Projects</h2>
              <button
                onClick={() => {
                  resetProjectForm();
                  setEditingProject(null);
                  setShowProjectForm(true);
                }}
                className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-yellow-500 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Project</span>
              </button>
            </div>

            {/* Projects List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                  <div className="aspect-video relative">
                    <img
                      src={project.main_image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    {project.featured && (
                      <div className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded text-xs font-medium">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-2 text-white">{project.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{project.category} • {project.location}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editProject(project)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other tabs content */}
        {activeTab === 'team' && (
          <div>
            <h2 className="text-2xl font-light text-yellow-400 mb-8">Team Members</h2>
            <div className="text-gray-400">Team management coming soon...</div>
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div>
            <h2 className="text-2xl font-light text-yellow-400 mb-8">Testimonials</h2>
            <div className="text-gray-400">Testimonials management coming soon...</div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-light text-yellow-400 mb-8">Site Settings</h2>
            <div className="text-gray-400">Settings management coming soon...</div>
          </div>
        )}
      </div>

      {/* Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-yellow-400/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light text-yellow-400">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h3>
              <button
                onClick={() => {
                  setShowProjectForm(false);
                  setEditingProject(null);
                  resetProjectForm();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleProjectSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors text-white"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Mixed-Use">Mixed-Use</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={projectForm.location}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                  <input
                    type="text"
                    value={projectForm.year}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Client</label>
                  <input
                    type="text"
                    value={projectForm.client}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, client: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Area</label>
                  <input
                    type="text"
                    value={projectForm.area}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, area: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                  <input
                    type="text"
                    value={projectForm.duration}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors text-white"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={projectForm.featured}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-600 rounded focus:ring-yellow-400"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-300">Featured Project</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors resize-none text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Details</label>
                <textarea
                  value={projectForm.details}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, details: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors resize-none text-white"
                  required
                />
              </div>

              {/* Main Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Main Image</label>
                <div className="space-y-4">
                  {projectForm.main_image && (
                    <div className="relative w-full h-48 bg-gray-800 rounded-lg overflow-hidden">
                      <img
                        src={projectForm.main_image}
                        alt="Main project image"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setProjectForm(prev => ({ ...prev, main_image: '' }))}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-sm text-gray-400">
                          {uploading ? 'Uploading...' : 'Click to upload main image'}
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, true);
                        }}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional Images Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Additional Images</label>
                <div className="space-y-4">
                  {/* Display uploaded additional images */}
                  {projectForm.additional_images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {projectForm.additional_images.map((image, index) => (
                        <div key={index} className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`Additional image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload button for additional images */}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-sm text-gray-400">
                          {uploading ? 'Uploading...' : 'Click to upload additional images'}
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach(file => handleImageUpload(file, false));
                        }}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  disabled={uploading || !projectForm.main_image}
                  className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingProject ? 'Update Project' : 'Create Project'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProjectForm(false);
                    setEditingProject(null);
                    resetProjectForm();
                  }}
                  className="bg-gray-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}