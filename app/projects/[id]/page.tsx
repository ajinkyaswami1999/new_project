'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import SocialMedia from '@/components/SocialMedia';
import Footer from '@/components/Footer';
import { ArrowLeft, MapPin, Calendar, User, Square, Clock, ArrowRight, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { projectsApi, type Project } from '@/lib/supabase';

export default function ProjectDetail() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  useEffect(() => {
    loadProject();
  }, [params.id]);

  const loadProject = async () => {
    try {
      const [projectData, allProjectsData] = await Promise.all([
        projectsApi.getById(params.id as string),
        projectsApi.getAll()
      ]);
      
      setProject(projectData);
      setAllProjects(allProjectsData);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="pt-24 min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-yellow-400 text-xl">Loading project...</div>
          </div>
        </main>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Navigation />
        <main className="pt-24 min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-light mb-4 text-yellow-400">Project Not Found</h1>
            <p className="text-gray-300 mb-8">The project you're looking for doesn't exist.</p>
            <Link
              href="/projects"
              className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
            >
              Back to Projects
            </Link>
          </div>
        </main>
      </>
    );
  }

  const relatedProjects = allProjects
    .filter(p => p.id !== project.id && p.category === project.category)
    .slice(0, 3);

  // Get project images - combine main image with additional images
  const projectImages = [
    project.main_image,
    ...(project.project_images?.map(img => img.image_url) || [])
  ].filter((img, index, arr) => img && arr.indexOf(img) === index); // Remove duplicates and null values

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % projectImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + projectImages.length) % projectImages.length);
  };

  return (
    <>
      <Navigation />
      <main className="pt-24">
        {/* Hero Section with Enhanced Design */}
        <section className="relative py-16 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD700' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/projects"
              className="inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 mb-12 transition-all duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Projects</span>
            </Link>
            
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-16 items-start">
              {/* Project Info - Enhanced */}
              <div className="xl:col-span-2 space-y-8">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 rounded-full font-semibold shadow-lg">
                      {project.category}
                    </span>
                    <div className="flex items-center space-x-2 text-gray-300 bg-gray-800/50 px-3 py-1 rounded-full">
                      <MapPin className="w-4 h-4 text-yellow-400" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300 bg-gray-800/50 px-3 py-1 rounded-full">
                      <Calendar className="w-4 h-4 text-yellow-400" />
                      <span>{project.year}</span>
                    </div>
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-light mb-6 tracking-tight text-white leading-tight">
                    {project.title}
                  </h1>
                  
                  <p className="text-xl text-gray-300 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Enhanced Project Details Grid */}
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-yellow-400/20 shadow-2xl">
                  <h3 className="text-xl font-semibold mb-6 text-yellow-400">Project Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-4 p-4 bg-black/30 rounded-lg">
                      <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Client</p>
                        <p className="text-white font-semibold">{project.client}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 bg-black/30 rounded-lg">
                      <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                        <Square className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Area</p>
                        <p className="text-white font-semibold">{project.area}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 bg-black/30 rounded-lg">
                      <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Duration</p>
                        <p className="text-white font-semibold">{project.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 bg-black/30 rounded-lg">
                      <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Completed</p>
                        <p className="text-white font-semibold">{project.year}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Image Gallery */}
              <div className="xl:col-span-3">
                <div className="relative group">
                  {/* Main Image Display */}
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gray-900">
                    {projectImages.length > 0 ? (
                      <>
                        <img
                          src={projectImages[currentImageIndex]}
                          alt={`${project.title} - Image ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover transition-all duration-500"
                        />
                        
                        {/* Image Overlay with Controls */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {/* Navigation Arrows */}
                          {projectImages.length > 1 && (
                            <>
                              <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300"
                              >
                                <ChevronLeft className="w-6 h-6" />
                              </button>
                              <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300"
                              >
                                <ChevronRight className="w-6 h-6" />
                              </button>
                            </>
                          )}
                          
                          {/* Fullscreen Button */}
                          <button
                            onClick={() => setIsGalleryOpen(true)}
                            className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300"
                          >
                            <Maximize2 className="w-5 h-5" />
                          </button>
                          
                          {/* Image Counter */}
                          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                            {currentImageIndex + 1} / {projectImages.length}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No images available
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnail Navigation */}
                  {projectImages.length > 1 && (
                    <div className="flex space-x-3 mt-6 overflow-x-auto pb-2">
                      {projectImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                            index === currentImageIndex
                              ? 'border-yellow-400 shadow-lg scale-105'
                              : 'border-gray-600 hover:border-gray-400 hover:scale-102'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${project.title} thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Project Details */}
        <section className="py-24 bg-gradient-to-b from-gray-900 to-black">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-3xl p-12 border border-yellow-400/20 shadow-2xl">
              <h2 className="text-4xl font-light mb-8 text-yellow-400 text-center">Project Overview</h2>
              <div className="prose prose-lg prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed text-lg text-center">
                  {project.details}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Image Gallery Grid */}
        {projectImages.length > 1 && (
          <section className="py-24 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl font-light mb-16 text-center text-yellow-400">Project Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projectImages.map((image, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gray-900"
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setIsGalleryOpen(true);
                    }}
                  >
                    <img
                      src={image}
                      alt={`${project.title} ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-sm font-medium">View Image</p>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="py-24 bg-gradient-to-b from-gray-900 to-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl font-light mb-16 text-center text-yellow-400">Related Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedProjects.map((relatedProject) => (
                  <Link
                    key={relatedProject.id}
                    href={`/projects/${relatedProject.id}`}
                    className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-yellow-400/20 hover:border-yellow-400/40 hover:-translate-y-2"
                  >
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={relatedProject.main_image}
                        alt={relatedProject.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-8">
                      <div className="flex items-center space-x-3 text-sm text-gray-400 mb-3">
                        <span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                          {relatedProject.category}
                        </span>
                        <span>{relatedProject.location}</span>
                      </div>
                      <h3 className="text-2xl font-light mb-4 text-white group-hover:text-yellow-400 transition-colors duration-300">
                        {relatedProject.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-6 line-clamp-3 leading-relaxed">
                        {relatedProject.description}
                      </p>
                      <div className="flex items-center text-yellow-400 text-sm font-semibold group-hover:space-x-3 transition-all duration-300">
                        <span>View Project</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Fullscreen Gallery Modal */}
        {isGalleryOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Close Button */}
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Navigation */}
              {projectImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              
              {/* Main Image */}
              <div className="max-w-6xl max-h-[90vh] relative">
                <img
                  src={projectImages[currentImageIndex]}
                  alt={`${project.title} - Image ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
                
                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                  {currentImageIndex + 1} of {projectImages.length}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <SocialMedia />
      <Footer />
    </>
  );
}