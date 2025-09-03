// 'use client';

// import { useState, useEffect } from 'react';
// import { Plus, Edit, Trash2, Upload, X, Save } from 'lucide-react';
// import { projectsApi, projectImagesApi, teamMembersApi, testimonialsApi, siteSettingsApi, adminUsersApi, type Project, type TeamMember, type Testimonial, type AdminUser } from '@/lib/supabase';
// import { uploadImage, deleteImage } from '@/lib/storage';

// interface ProjectForm extends Omit<Project, 'id' | 'created_at' | 'updated_at' | 'project_images'> {
//   additional_images: string[];
// }

// export default function AdminPanel() {
//   const [activeTab, setActiveTab] = useState('projects');
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
//   const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [editingProject, setEditingProject] = useState<Project | null>(null);
//   const [showProjectForm, setShowProjectForm] = useState(false);
//   const [uploading, setUploading] = useState(false);

//   const [projectForm, setProjectForm] = useState<ProjectForm>({
//     title: '',
//     category: '',
//     location: '',
//     year: '',
//     description: '',
//     details: '',
//     client: '',
//     area: '',
//     duration: '',
//     featured: false,
//     main_image: '',
//     additional_images: []
//   });

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       const [projectsData, teamData, testimonialsData] = await Promise.all([
//         projectsApi.getAll(),
//         teamMembersApi.getAll(),
//         testimonialsApi.getAll()
//       ]);

//       setProjects(projectsData);
//       setTeamMembers(teamData);
//       setTestimonials(testimonialsData);
//     } catch (error) {
//       console.error('Error loading data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleImageUpload = async (file: File, isMainImage: boolean = false) => {
//     if (!file) return;

//     setUploading(true);
//     try {
//       const imageUrl = await uploadImage(file);

//       if (isMainImage) {
//         setProjectForm(prev => ({ ...prev, main_image: imageUrl }));
//       } else {
//         setProjectForm(prev => ({
//           ...prev,
//           additional_images: [...prev.additional_images, imageUrl]
//         }));
//       }
//     } catch (error) {
//       console.error('Error uploading image:', error);
//       alert('Error uploading image. Please try again.');
//     } finally {
//       setUploading(false);
//     }
//   };

//   const removeAdditionalImage = (index: number) => {
//     setProjectForm(prev => ({
//       ...prev,
//       additional_images: prev.additional_images.filter((_, i) => i !== index)
//     }));
//   };

//   const handleProjectSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const projectData = {
//         title: projectForm.title,
//         category: projectForm.category,
//         location: projectForm.location,
//         year: projectForm.year,
//         description: projectForm.description,
//         details: projectForm.details,
//         client: projectForm.client,
//         area: projectForm.area,
//         duration: projectForm.duration,
//         featured: projectForm.featured,
//         main_image: projectForm.main_image
//       };

//       let savedProject: Project;

//       if (editingProject) {
//         savedProject = await projectsApi.update(editingProject.id, projectData);
//       } else {
//         savedProject = await projectsApi.create(projectData);
//       }

//       // Handle additional images
//       if (projectForm.additional_images.length > 0) {
//         for (let i = 0; i < projectForm.additional_images.length; i++) {
//           await projectImagesApi.create({
//             project_id: savedProject.id,
//             image_url: projectForm.additional_images[i],
//             alt_text: `${savedProject.title} - Image ${i + 2}`,
//             sort_order: i + 1
//           });
//         }
//       }

//       await loadData();
//       setShowProjectForm(false);
//       setEditingProject(null);
//       resetProjectForm();
//       alert(editingProject ? 'Project updated successfully!' : 'Project created successfully!');
//     } catch (error) {
//       console.error('Error saving project:', error);
//       alert('Error saving project. Please try again.');
//     }
//   };

//   const resetProjectForm = () => {
//     setProjectForm({
//       title: '',
//       category: '',
//       location: '',
//       year: '',
//       description: '',
//       details: '',
//       client: '',
//       area: '',
//       duration: '',
//       featured: false,
//       main_image: '',
//       additional_images: []
//     });
//   };

//   const editProject = (project: Project) => {
//     setEditingProject(project);
//     setProjectForm({
//       title: project.title,
//       category: project.category,
//       location: project.location,
//       year: project.year,
//       description: project.description,
//       details: project.details,
//       client: project.client,
//       area: project.area,
//       duration: project.duration,
//       featured: project.featured,
//       main_image: project.main_image,
//       additional_images: project.project_images?.map(img => img.image_url) || []
//     });
//     setShowProjectForm(true);
//   };

//   const deleteProject = async (id: string) => {
//     if (confirm('Are you sure you want to delete this project?')) {
//       try {
//         await projectsApi.delete(id);
//         await loadData();
//         alert('Project deleted successfully!');
//       } catch (error) {
//         console.error('Error deleting project:', error);
//         alert('Error deleting project. Please try again.');
//       }
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
//           <div className="text-yellow-400 text-xl">Loading admin panel...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black text-white">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="mb-8">
//           <h1 className="text-4xl font-light text-yellow-400 mb-2">Admin Panel</h1>
//           <p className="text-gray-300">Manage your website content</p>
//         </div>

//         {/* Tabs */}
//         <div className="flex space-x-1 mb-8 bg-gray-900 p-1 rounded-lg">
//           {['projects', 'team', 'testimonials', 'settings'].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-6 py-3 rounded-md font-medium capitalize transition-colors ${activeTab === tab
//                   ? 'bg-yellow-400 text-black'
//                   : 'text-gray-300 hover:text-white hover:bg-gray-800'
//                 }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         {/* Projects Tab */}
//         {activeTab === 'projects' && (
//           <div>
//             <div className="flex justify-between items-center mb-8">
//               <h2 className="text-2xl font-light text-yellow-400">Projects</h2>
//               <button
//                 onClick={() => {
//                   resetProjectForm();
//                   setEditingProject(null);
//                   setShowProjectForm(true);
//                 }}
//                 className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-yellow-500 transition-colors"
//               >
//                 <Plus className="w-5 h-5" />
//                 <span>Add Project</span>
//               </button>
//             </div>

//             {/* Projects List */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {projects.map((project) => (
//                 <div key={project.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
//                   <div className="aspect-video relative">
//                     <img
//                       src={project.main_image}
//                       alt={project.title}
//                       className="w-full h-full object-cover"
//                     />
//                     {project.featured && (
//                       <div className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded text-xs font-medium">
//                         Featured
//                       </div>
//                     )}
//                   </div>
//                   <div className="p-4">
//                     <h3 className="font-medium mb-2 text-white">{project.title}</h3>
//                     <p className="text-gray-400 text-sm mb-3">{project.category} • {project.location}</p>
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => editProject(project)}
//                         className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
//                       >
//                         <Edit className="w-4 h-4" />
//                         <span>Edit</span>
//                       </button>
//                       <button
//                         onClick={() => deleteProject(project.id)}
//                         className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                         <span>Delete</span>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Other tabs content */}
//         {activeTab === 'team' && (
//           <div>
//             <h2 className="text-2xl font-light text-yellow-400 mb-8">Team Members</h2>
//             <div className="text-gray-400">Team management coming soon...</div>
//           </div>
//         )}

//         {activeTab === 'testimonials' && (
//           <div>
//             <h2 className="text-2xl font-light text-yellow-400 mb-8">Testimonials</h2>
//             <div className="text-gray-400">Testimonials management coming soon...</div>
//           </div>
//         )}

//         {activeTab === 'settings' && (
//           <div>
//             <h2 className="text-2xl font-light text-yellow-400 mb-8">Site Settings</h2>
//             <div className="text-gray-400">Settings management coming soon...</div>
//           </div>
//         )}
//       </div>

//       {/* Project Form Modal */}
//       {showProjectForm && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-gray-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-yellow-400/20">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-2xl font-light text-yellow-400">
//                 {editingProject ? 'Edit Project' : 'Add New Project'}
//               </h3>
//               <button
//                 onClick={() => {
//                   setShowProjectForm(false);
//                   setEditingProject(null);
//                   resetProjectForm();
//                 }}
//                 className="text-gray-400 hover:text-white transition-colors"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <form onSubmit={handleProjectSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
//                   <input
//                     type="text"
//                     value={projectForm.title}
//                     onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
//                     className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors text-white"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
//                   <select
//                     value={projectForm.category}
//                     onChange={(e) => setProjectForm(prev => ({ ...prev, category: e.target.value }))}
//                     className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors text-white"
//                     required
//                   >
//                     <option value="">Select Category</option>
//                     <option value="Residential">Residential</option>
//                     <option value="Commercial">Commercial</option>
//                     <option value="Hospitality">Hospitality</option>
//                     <option value="Mixed-Use">Mixed-Use</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
//                   <input
//                     type="text"
//                     value={projectForm.location}
//                     onChange={(e) => setProjectForm(prev => ({ ...prev, location: e.target.value }))}
//                     className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors text-white"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
//                   <input
//                     type="text"
//                     value={projectForm.year}
//                     onChange={(e) => setProjectForm(prev => ({ ...prev, year: e.target.value }))}
//                     className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors text-white"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Client</label>
//                   <input
//                     type="text"
//                     value={projectForm.client}
//                     onChange={(e) => setProjectForm(prev => ({ ...prev, client: e.target.value }))}
//                     className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors text-white"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Area</label>
//                   <input
//                     type="text"
//                     value={projectForm.area}
//                     onChange={(e) => setProjectForm(prev => ({ ...prev, area: e.target.value }))}
//                     className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors text-white"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
//                   <input
//                     type="text"
//                     value={projectForm.duration}
//                     onChange={(e) => setProjectForm(prev => ({ ...prev, duration: e.target.value }))}
//                     className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors text-white"
//                     required
//                   />
//                 </div>
//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="featured"
//                     checked={projectForm.featured}
//                     onChange={(e) => setProjectForm(prev => ({ ...prev, featured: e.target.checked }))}
//                     className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-600 rounded focus:ring-yellow-400"
//                   />
//                   <label htmlFor="featured" className="ml-2 text-sm text-gray-300">Featured Project</label>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
//                 <textarea
//                   value={projectForm.description}
//                   onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
//                   rows={3}
//                   className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors resize-none text-white"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">Details</label>
//                 <textarea
//                   value={projectForm.details}
//                   onChange={(e) => setProjectForm(prev => ({ ...prev, details: e.target.value }))}
//                   rows={4}
//                   className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors resize-none text-white"
//                   required
//                 />
//               </div>

//               {/* Main Image Upload */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">Main Image</label>
//                 <div className="space-y-4">
//                   {projectForm.main_image && (
//                     <div className="relative w-full h-48 bg-gray-800 rounded-lg overflow-hidden">
//                       <img
//                         src={projectForm.main_image}
//                         alt="Main project image"
//                         className="w-full h-full object-cover"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setProjectForm(prev => ({ ...prev, main_image: '' }))}
//                         className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
//                       >
//                         <X className="w-4 h-4" />
//                       </button>
//                     </div>
//                   )}
//                   <div className="flex items-center justify-center w-full">
//                     <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors">
//                       <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                         <Upload className="w-8 h-8 mb-2 text-gray-400" />
//                         <p className="text-sm text-gray-400">
//                           {uploading ? 'Uploading...' : 'Click to upload main image'}
//                         </p>
//                       </div>
//                       <input
//                         type="file"
//                         className="hidden"
//                         accept="image/*"
//                         onChange={(e) => {
//                           const file = e.target.files?.[0];
//                           if (file) handleImageUpload(file, true);
//                         }}
//                         disabled={uploading}
//                       />
//                     </label>
//                   </div>
//                 </div>
//               </div>

//               {/* Additional Images Upload */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">Additional Images</label>
//                 <div className="space-y-4">
//                   {/* Display uploaded additional images */}
//                   {projectForm.additional_images.length > 0 && (
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                       {projectForm.additional_images.map((image, index) => (
//                         <div key={index} className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden">
//                           <img
//                             src={image}
//                             alt={`Additional image ${index + 1}`}
//                             className="w-full h-full object-cover"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => removeAdditionalImage(index)}
//                             className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
//                           >
//                             <X className="w-3 h-3" />
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                   {/* Upload button for additional images */}
//                   <div className="flex items-center justify-center w-full">
//                     <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors">
//                       <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                         <Upload className="w-8 h-8 mb-2 text-gray-400" />
//                         <p className="text-sm text-gray-400">
//                           {uploading ? 'Uploading...' : 'Click to upload additional images'}
//                         </p>
//                       </div>
//                       <input
//                         type="file"
//                         className="hidden"
//                         accept="image/*"
//                         multiple
//                         onChange={(e) => {
//                           const files = Array.from(e.target.files || []);
//                           files.forEach(file => handleImageUpload(file, false));
//                         }}
//                         disabled={uploading}
//                       />
//                     </label>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex space-x-4 pt-6">
//                 <button
//                   type="submit"
//                   disabled={uploading || !projectForm.main_image}
//                   className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <Save className="w-5 h-5" />
//                   <span>{editingProject ? 'Update Project' : 'Create Project'}</span>
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowProjectForm(false);
//                     setEditingProject(null);
//                     resetProjectForm();
//                   }}
//                   className="bg-gray-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, Save } from 'lucide-react';
import {
  projectsApi,
  projectImagesApi,
  teamMembersApi,
  testimonialsApi,
  siteSettingsApi,
  adminUsersApi,
  type Project,
  type TeamMember,
  type Testimonial,
  type AdminUser
} from '@/lib/supabase';
import { uploadImage } from '@/lib/storage';

//
// 📂 Interfaces
//
interface ProjectForm extends Omit<Project, 'id' | 'created_at' | 'updated_at' | 'project_images'> {
  additional_images: string[];
}

//
// 📂 Main Admin Panel
//
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('projects');
  const [loading, setLoading] = useState(true);

  // 📂 Projects state
  const [projects, setProjects] = useState<Project[]>([]);
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

  // 📂 Team state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // 📂 Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // 📂 Admin Users state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  // 📂 Site Settings state
  const [siteSettings, setSiteSettings] = useState<any>(null);

  //
  // 🔄 Load all data on mount
  //
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsData, teamData, testimonialsData, settingsData, adminUsersData] =
        await Promise.all([
          projectsApi.getAll(),
          teamMembersApi.getAll(),
          testimonialsApi.getAll(),
          siteSettingsApi.getAll(),
          adminUsersApi.getAll()
        ]);

      setProjects(projectsData);
      setTeamMembers(teamData);
      setTestimonials(testimonialsData);
      setSiteSettings(settingsData[0] || null);
      setAdminUsers(adminUsersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  //
  // 📂 Project Helpers
  //
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
  //
  // 📂 Project Submit (Create/Update)
  //
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        // update
        await projectsApi.update(editingProject.id, {
          ...projectForm,
          project_images: projectForm.additional_images.map(url => ({ image_url: url }))
        });
        alert('Project updated successfully!');
      } else {
        // create
        await projectsApi.create({
          ...projectForm,
          project_images: projectForm.additional_images.map(url => ({ image_url: url }))
        });
        alert('Project created successfully!');
      }

      await loadData();
      resetProjectForm();
      setEditingProject(null);
      setShowProjectForm(false);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project. Please try again.');
    }
  };

  //
  // 📂 Projects Tab UI
  //
  const ProjectsTab = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Projects</h2>
        <button
          onClick={() => {
            resetProjectForm();
            setEditingProject(null);
            setShowProjectForm(true);
          }}
          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Project
        </button>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <div key={project.id} className="border rounded-lg p-4 shadow-sm">
            {project.main_image && (
              <img
                src={project.main_image}
                alt={project.title}
                className="w-full h-48 object-cover rounded mb-2"
              />
            )}
            <h3 className="font-semibold">{project.title}</h3>
            <p className="text-sm text-gray-600">{project.category}</p>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => editProject(project)}
                className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteProject(project.id)}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setShowProjectForm(false);
                setEditingProject(null);
                resetProjectForm();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-4">
              {editingProject ? 'Edit Project' : 'Add Project'}
            </h2>

            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={projectForm.title}
                onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={projectForm.category}
                onChange={e => setProjectForm({ ...projectForm, category: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Location"
                value={projectForm.location}
                onChange={e => setProjectForm({ ...projectForm, location: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Year"
                value={projectForm.year}
                onChange={e => setProjectForm({ ...projectForm, year: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <textarea
                placeholder="Description"
                value={projectForm.description}
                onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <textarea
                placeholder="Details"
                value={projectForm.details}
                onChange={e => setProjectForm({ ...projectForm, details: e.target.value })}
                className="w-full border p-2 rounded"
              />

              {/* Main Image Upload */}
              <div>
                <label className="block font-medium mb-1">Main Image</label>
                {projectForm.main_image && (
                  <img
                    src={projectForm.main_image}
                    alt="Main"
                    className="w-full h-40 object-cover rounded mb-2"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => e.target.files && handleImageUpload(e.target.files[0], true)}
                />
              </div>

              {/* Additional Images Upload */}
              <div>
                <label className="block font-medium mb-1">Additional Images</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {projectForm.additional_images.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt="" className="w-24 h-24 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => {
                    if (e.target.files) {
                      Array.from(e.target.files).forEach(file => handleImageUpload(file, false));
                    }
                  }}
                />
              </div>

              {/* Submit / Cancel */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowProjectForm(false);
                    setEditingProject(null);
                    resetProjectForm();
                  }}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  {editingProject ? 'Update Project' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
  //
  // 📂 Team Members
  //
  const TeamTab = () => {
    const [newMember, setNewMember] = useState<Partial<TeamMember>>({});
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

    const saveMember = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (editingMember) {
          await teamMembersApi.update(editingMember.id, newMember);
          alert('Team member updated!');
        } else {
          await teamMembersApi.create(newMember);
          alert('Team member added!');
        }
        await loadData();
        setNewMember({});
        setEditingMember(null);
      } catch (error) {
        console.error('Error saving member:', error);
        alert('Error saving team member.');
      }
    };

    const deleteMember = async (id: string) => {
      if (confirm('Delete this team member?')) {
        await teamMembersApi.delete(id);
        await loadData();
      }
    };

    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Team Members</h2>
        <form onSubmit={saveMember} className="space-y-2 mb-6">
          <input
            type="text"
            placeholder="Name"
            value={newMember.name || ''}
            onChange={e => setNewMember({ ...newMember, name: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Role"
            value={newMember.role || ''}
            onChange={e => setNewMember({ ...newMember, role: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Image URL"
            value={newMember.image_url || ''}
            onChange={e => setNewMember({ ...newMember, image_url: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {editingMember ? 'Update Member' : 'Add Member'}
            </button>
            {editingMember && (
              <button
                type="button"
                onClick={() => {
                  setEditingMember(null);
                  setNewMember({});
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teamMembers.map(member => (
            <div key={member.id} className="border rounded p-4">
              {member.image_url && (
                <img
                  src={member.image_url}
                  alt={member.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-semibold">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.role}</p>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setEditingMember(member);
                    setNewMember(member);
                  }}
                  className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteMember(member.id)}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  //
  // 📂 Testimonials
  //
  const TestimonialsTab = () => {
    const [newTestimonial, setNewTestimonial] = useState<Partial<Testimonial>>({});
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

    const saveTestimonial = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (editingTestimonial) {
          await testimonialsApi.update(editingTestimonial.id, newTestimonial);
          alert('Testimonial updated!');
        } else {
          await testimonialsApi.create(newTestimonial);
          alert('Testimonial added!');
        }
        await loadData();
        setNewTestimonial({});
        setEditingTestimonial(null);
      } catch (error) {
        console.error('Error saving testimonial:', error);
        alert('Error saving testimonial.');
      }
    };

    const deleteTestimonial = async (id: string) => {
      if (confirm('Delete this testimonial?')) {
        await testimonialsApi.delete(id);
        await loadData();
      }
    };

    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Testimonials</h2>
        <form onSubmit={saveTestimonial} className="space-y-2 mb-6">
          <input
            type="text"
            placeholder="Name"
            value={newTestimonial.name || ''}
            onChange={e => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Role"
            value={newTestimonial.role || ''}
            onChange={e => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <textarea
            placeholder="Message"
            value={newTestimonial.message || ''}
            onChange={e => setNewTestimonial({ ...newTestimonial, message: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
            </button>
            {editingTestimonial && (
              <button
                type="button"
                onClick={() => {
                  setEditingTestimonial(null);
                  setNewTestimonial({});
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map(t => (
            <div key={t.id} className="border rounded p-4">
              <p className="italic">"{t.message}"</p>
              <p className="mt-2 font-semibold">{t.name}</p>
              <p className="text-sm text-gray-600">{t.role}</p>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setEditingTestimonial(t);
                    setNewTestimonial(t);
                  }}
                  className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteTestimonial(t.id)}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  //
  // 📂 Site Settings
  //
  const SettingsTab = () => {
    const [settings, setSettings] = useState(siteSettings || {});

    const saveSettings = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (siteSettings?.id) {
          await siteSettingsApi.update(siteSettings.id, settings);
        } else {
          await siteSettingsApi.create(settings);
        }
        await loadData();
        alert('Settings saved!');
      } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error saving settings.');
      }
    };

    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Site Settings</h2>
        <form onSubmit={saveSettings} className="space-y-2">
          <input
            type="text"
            placeholder="Address"
            value={settings.address || ''}
            onChange={e => setSettings({ ...settings, address: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Phone"
            value={settings.phone || ''}
            onChange={e => setSettings({ ...settings, phone: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="email"
            placeholder="Email"
            value={settings.email || ''}
            onChange={e => setSettings({ ...settings, email: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Facebook"
            value={settings.facebook || ''}
            onChange={e => setSettings({ ...settings, facebook: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Instagram"
            value={settings.instagram || ''}
            onChange={e => setSettings({ ...settings, instagram: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Twitter"
            value={settings.twitter || ''}
            onChange={e => setSettings({ ...settings, twitter: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="YouTube"
            value={settings.youtube || ''}
            onChange={e => setSettings({ ...settings, youtube: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save Settings
          </button>
        </form>
      </div>
    );
  };

  //
  // 📂 Admin Users
  //
  const UsersTab = () => {
    const [newUser, setNewUser] = useState<Partial<AdminUser>>({});
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

    const saveUser = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (editingUser) {
          await adminUsersApi.update(editingUser.id, newUser);
          alert('User updated!');
        } else {
          await adminUsersApi.create(newUser);
          alert('User added!');
        }
        await loadData();
        setNewUser({});
        setEditingUser(null);
      } catch (error) {
        console.error('Error saving user:', error);
        alert('Error saving user.');
      }
    };

    const deleteUser = async (id: string) => {
      if (confirm('Delete this user?')) {
        await adminUsersApi.delete(id);
        await loadData();
      }
    };

    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Admin Users</h2>
        <form onSubmit={saveUser} className="space-y-2 mb-6">
          <input
            type="text"
            placeholder="Username"
            value={newUser.username || ''}
            onChange={e => setNewUser({ ...newUser, username: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password || ''}
            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <select
            value={newUser.role || ''}
            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
            className="border p-2 rounded w-full"
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {editingUser ? 'Update User' : 'Add User'}
            </button>
            {editingUser && (
              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setNewUser({});
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminUsers.map(u => (
            <div key={u.id} className="border rounded p-4">
              <p className="font-semibold">{u.username}</p>
              <p className="text-sm text-gray-600">Role: {u.role}</p>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setEditingUser(u);
                    setNewUser(u);
                  }}
                  className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteUser(u.id)}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  //
  // 📂 Final Return with Navigation
  //
  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <nav className="flex gap-4 border-b mb-6 pb-2">
        <button
          onClick={() => setActiveTab('projects')}
          className={activeTab === 'projects' ? 'font-bold' : ''}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={activeTab === 'team' ? 'font-bold' : ''}
        >
          Team
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={activeTab === 'testimonials' ? 'font-bold' : ''}
        >
          Testimonials
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={activeTab === 'settings' ? 'font-bold' : ''}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={activeTab === 'users' ? 'font-bold' : ''}
        >
          Admin Users
        </button>
      </nav>

      {activeTab === 'projects' && <ProjectsTab />}
      {activeTab === 'team' && <TeamTab />}
      {activeTab === 'testimonials' && <TestimonialsTab />}
      {activeTab === 'settings' && <SettingsTab />}
      {activeTab === 'users' && <UsersTab />}
    </div>
  );
}
