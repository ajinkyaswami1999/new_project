// 

import { projectsApi } from '@/lib/supabase';
import ProjectDetail from './ProjectDetail';

// ✅ Generate static paths for all projects
export async function generateStaticParams() {
  const projects = await projectsApi.getAll();

  return projects.map((project) => ({
    id: project.id.toString(),
  }));
}

export default async function ProjectPage({ params }: { params: { id: string } }) {
  return <ProjectDetail id={params.id} />;
}
