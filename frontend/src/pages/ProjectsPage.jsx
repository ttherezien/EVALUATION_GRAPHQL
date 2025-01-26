import { Link } from 'react-router-dom';
import { PlusCircle, Search, Trash } from 'lucide-react';
import { ProjectCard } from '../components/ProjectCard';
import { useQuery, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useMutation } from '@apollo/client';

const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      description
    }
  }
`;


const CREATE_PROJECT = gql`
  mutation CreateProject($name: String!, $description: String!) {
    createProject(name: $name, description: $description) {
      id
      name
      description
    }
  }
`;


const deleteProject = gql`
  mutation DeleteProject($projectId: Int!) {
    deleteProject(projectId: $projectId) {
      id
    }
  }
`;



export const ProjectsPage = () => {
  const { data, loading, error, refetch } = useQuery(GET_PROJECTS);
  const navigate = useNavigate();

  useEffect(() => {
    refetch();
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
    if (error) {
      localStorage.removeItem('token');
    }
    console.log(data);
    
  }, [navigate, refetch]);

  const [createProject] = useMutation(CREATE_PROJECT);

  const handleNewProject = () => {
    createProject({
      variables: {
        name: 'Nouveau Projet',
        description: 'Description du nouveau projet',
      },
    }).then(() => {
      refetch();
    }).catch((error) => {
      return alert(error);
    });
  }

  if (loading) return <p>Chargement des projets...</p>;
  
  const projects = data?.projects || [];

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
            <ProjectCard project={project}  />
          </Link>
        ))}
      </div>
    </div>
  );
};
