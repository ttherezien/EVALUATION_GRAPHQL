import { Link } from 'react-router-dom';
import { PlusCircle, Search } from 'lucide-react';
import { ProjectCard } from '../components/ProjectCard';

export const ProjectsPage = () => {
  // Stub de données (à enlever quand la query fonctionne)
  const projects = [
    { id: '1', name: 'Projet 1', description: 'Description du projet 1' },
    { id: '2', name: 'Projet 2', description: 'Description du projet 2' },
  ];

  const handleNewProject = () => {
    alert('TODO: Implémenter la mutation de création de projet');
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mes Projets</h2>
          <button 
            onClick={handleNewProject}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Nouveau Projet
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link 
            key={project.id} 
            to={`/projects/${project.id}`}
            className="block hover:no-underline"
          >
            <ProjectCard project={project} />
          </Link>
        ))}
      </div>
    </div>
  );
}