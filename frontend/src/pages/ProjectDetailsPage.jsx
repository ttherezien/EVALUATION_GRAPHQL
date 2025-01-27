import { Link, useNavigate, useParams } from 'react-router-dom';
import { TaskItem } from '../components/TaskItem';
import { CommentList } from '../components/CommentList';
import { PlusCircle, CheckSquare, MessageSquare, ArrowLeft, Calendar, Trash } from 'lucide-react';
import { gql, useQuery, useMutation,useSubscription } from '@apollo/client';
import { useEffect, useState } from 'react';


const GET_PROJECT_BY_ID = gql`
  query GetProject($id: Int!) {
    getProject(id: $id) {
      id
      name
      description
      owner {
        id
      }
      comments {
        id
        authorId
        content
      }
      tasks {
        id
        status
        title
      }
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($projectId: Int!, $title: String!, $status: String!) {
    createTask(projectId: $projectId, title: $title, status: $status) {
      id
      title
      status
    }
  }
`;

const UPDATE_PROJECT = gql`
  mutation UpdateProject($projectId: Int!, $name: String!, $description: String!) {
    updateProject(projectId: $projectId, name: $name, description: $description) {
      id
      name
      description
    }
  }
`;

const DELETE_PROJECT = gql`
  mutation DeleteProject($projectId: Int!) {
    deleteProject(projectId: $projectId) {
      id
    }
  }
`;

const CREATE_COMMENT = gql`
  mutation CreateComment($projectId: Int!, $content: String!) {
    createComment(projectId: $projectId, content: $content) {
      id
      content
    }
  }
`;

const COMMENT_ADDED = gql`
  subscription CommentAdded($projectId: Int!) {
    commentAdded(projectId: $projectId) {
      id
      authorId
      content
      projectId
    }
  }
`;




export const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const projectIdInt = parseInt(projectId, 10);

  const { loading, error, data, refetch } = useQuery(GET_PROJECT_BY_ID, {
    variables: { id: projectIdInt },
  });

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [comments, setComments] = useState([]); // État local pour les commentaires

  const { data: commentData } = useSubscription(COMMENT_ADDED, {
    variables: { projectId: projectIdInt },
  });

  // Mettre à jour les données du projet si elles changent ou si un commentaire est ajouté
  useEffect(() => {
    if (data?.getProject) {
      setProjectName(data.getProject.name);
      setDescription(data.getProject.description);
      setComments(data.getProject.comments); // No need to map here
    }
  }, [data]);
  
  useEffect(() => {
    if (commentData?.commentAdded) {
      // Vérifier si le commentaire ajouté est déjà dans la liste
      setComments((prevComments) => {
        const isNewComment = !prevComments.some(
          (comment) => comment.id === commentData.commentAdded.id
        );
        
        if (isNewComment) {
          // Ajouter le commentaire uniquement s'il est nouveau
          return [...prevComments, commentData.commentAdded];
        }
        
        return prevComments; // Sinon, on ne modifie pas l'état
      });
    }
  }, [commentData]);
  

  const [createTask] = useMutation(CREATE_TASK, { onCompleted: refetch });
  const [updateProject] = useMutation(UPDATE_PROJECT, { onCompleted: refetch });
  const [deleteProject] = useMutation(DELETE_PROJECT, {
    onCompleted: () => navigate('/'),
  });
  const [createComment] = useMutation(CREATE_COMMENT, { onCompleted: refetch });

  if (loading) return <p>Chargement du projet...</p>;
  if (error) return <p>Erreur : {error.message}</p>;

  const project = data?.getProject || {};
  const idUser = localStorage.getItem('id');







  return (
    <div>
      <Link 
        to="/" 
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux projets
      </Link>

      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className='flex flex-col'>
              <input 
                disabled={idUser != project.owner.id}
                className="text-3xl font-bold text-gray-900 mb-2 border border-white rounded-lg hover:border-gray-500 p-1"
                placeholder='Veuillez mettre un titre'
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)} 
                onBlur={() => updateProject({ variables: { projectId: projectIdInt, name: projectName, description } })} 
              />
              <input 
                disabled={idUser != project.owner.id}
                className="text-gray-700 border border-white rounded-lg hover:border-gray-500 p-1" 
                placeholder='Veuillez mettre une description' 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                onBlur={() => updateProject({ variables: { projectId: projectIdInt, name: projectName, description } })} 
              />
            </div>
            <div className="flex flex-col justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Créé le 12 Jan 2024</span> 
              </div>
              { idUser ==  project.owner.id &&
              <Trash
               className='h-5 w-5 text-red-600 cursor-pointer hover:text-red-700'
               onClick={() => deleteProject({ variables: { projectId: projectIdInt } })} 
              />
            }
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5 text-indigo-600" />
              <h3 className="text-xl font-semibold text-gray-900">Tâches</h3>
            </div>
            
            {  idUser == project.owner.id &&
              
              <button 
              className="inline-flex items-center px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              onClick={() => createTask({ variables: { projectId: projectIdInt, title: 'Nouvelle tâche', status: 'TODO' } })} 
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter une tâche
            </button>

}
          </div>
          <ul className="space-y-3">
            {project.tasks.map((task) => (
              <li key={task.id}>
                <TaskItem task={task} refetchFunction={refetch} idOwner={project.owner.id} />
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              <h3 className="text-xl font-semibold text-gray-900">Commentaires</h3>
            </div>
            <button 
              onClick={() => createComment({ variables: { projectId: projectIdInt, content: prompt('Ajouter un commentaire') } })}
              className="inline-flex items-center px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter un commentaire
            </button>
          </div>
          <CommentList comments={comments} />
        </div>
      </div>
    </div>
  );
};