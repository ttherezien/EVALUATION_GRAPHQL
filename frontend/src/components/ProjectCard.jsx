import { Folder, ChevronRight, Clock } from 'lucide-react';
import { useQuery, gql } from '@apollo/client';

const GET_USER_BY_ID = gql`
  query GetUserById($id: Int!) {
    getUserById(id: $id) {
      id
      email
    }
  }
`;

export const ProjectCard = ({ project }) => {
  const { data, loading, error } = useQuery(GET_USER_BY_ID, {
    variables: { id: project.ownerId },
    skip: !project.ownerId,
  });

  const ownerEmail = data?.getUserById?.email || 'Inconnu';
  const idUser = localStorage.getItem('id'); // ID de l'utilisateur connecté

  // Déterminer la couleur de la carte selon le propriétaire du projet
  const getProjectColor = (ownerId) => {
    return ownerId == idUser
      ? "bg-indigo-50 border-indigo-300 hover:border-indigo-500"
      : "bg-red-50 border-red-300 hover:border-red-500";
  };
  const getColorFolder = (ownerId) => {
    return ownerId == idUser ? "text-indigo-600" : "text-red-600 ";
  }
  const getColorBGFolder = (ownerId) => {
    return ownerId == idUser ? "bg-indigo-200" : "bg-red-200";
  }

  return (
    <div className={`group rounded-lg border p-6 hover:shadow-lg transition-all duration-200 ${getProjectColor(project.ownerId)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`h-10 w-10 flex items-center justify-center rounded-lg ${getColorBGFolder(project.ownerId)}`}>
            <Folder className={`h-6 w-6 ${getColorFolder(project.ownerId)}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors duration-200" />
      </div>
      <p className="text-gray-600 mb-4">{project.description}</p>
      <div className="flex items-center text-sm text-gray-500">
        <Clock className="h-4 w-4 mr-1" />
        <span>Créé par {loading ? 'Chargement...' : error ? 'Erreur' : ownerEmail}</span>
      </div>
    </div>
  );
};
