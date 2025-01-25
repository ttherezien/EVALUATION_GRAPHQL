import { Link, useParams } from 'react-router-dom';
import {TaskItem} from '../components/TaskItem';
import {CommentList} from '../components/CommentList';
import { PlusCircle, CheckSquare, MessageSquare, ArrowLeft, Calendar } from 'lucide-react';
import { gql } from '@apollo/client';
import { useQuery,useMutation } from '@apollo/client';
import { useEffect } from 'react';
import { useState } from 'react';


const GETPROJECTBYID = gql`
  query GetProject($id: Int!) { 
    getProject(id: $id) {
      id
      name
      description
      comments {
        authorId
        content
        id
        projectId
        taskId
      }
      tasks {
        id
        status
        title
      }
    }
  }
`;

const CREATETASK = gql`
  mutation CreateTask($projectId: Int!, $title: String!, $status: String!) {
    createTask(projectId: $projectId, title: $title, status: $status) {
      id
      title
      status
    }
  }
`;



const UPDATEPROJECT = gql`
  mutation UpdateProject($projectId: Int!, $name: String!, $description: String!) {
    updateProject(projectId: $projectId, name: $name, description: $description) {
      id
      name
      description
    }
  }
`;


export const ProjectDetailsPage = () => {
  const { projectId } = useParams();

  


  const projectIdInt = parseInt(projectId, 10);

  const { loading, error, data, refetch } = useQuery(GETPROJECTBYID, {
    variables: { id: projectIdInt },
  });

  const [projectname, setProjectname] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (data?.getProject) {
      setProjectname(data.getProject.name);
      setDescription(data.getProject.description);
    }
  }, [data]);

  const [createTask] = useMutation(CREATETASK);
  const [updateProject] = useMutation(UPDATEPROJECT);


  const project = data?.getProject || {};

  if (loading) {
    console.log("Loading project details...");
    return <p>Chargement du projet...</p>;
  }

  if (error) {
    console.error("Error fetching project details:", error.message);
    return <p>Erreur : {error.message}</p>;
  }

  if (data) {
    console.log("Fetched project details:", data);
  }

  const handleAddTask = async () => {
    try {
      await createTask({
        variables: {
          projectId: projectIdInt,
          title: 'Nouvelle tâche',
          status: 'TODO',
        },
      });
      console.log("Task created");
      refetch();
    } catch (error) {
      console.error("Error creating task:", error.message);
    }
  };

  const modifyProject = async () => {
    try {
      await updateProject({
        variables: {
          projectId: projectIdInt,
          name: projectname,
          description: description,
        },
      });
      console.log("Project name updated");
      refetch();
    } catch (error) {
      console.error("Error updating project name:", error.message);
    }
  };
    



  const handleAddComment = () => {
    alert('TODO: Mutation pour ajouter un nouveau commentaire');
  };
  let i = 0;



  




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
              <input className="text-3xl font-bold text-gray-900 mb-2 border border-white rounded-lg hover:border-gray-500 p-1" placeholder='Veuillez mettre un titre' value={projectname} onChange={(e) => setProjectname(e.target.value)} onBlur={() => modifyProject()} />
              <input className="text-gray-700 border border-white rounded-lg hover:border-gray-500 p-1" placeholder='Veuillez mettre une description' value={description} onChange={(e) => setDescription(e.target.value)} onBlur={() => modifyProject()} />
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Créé le 12 Jan 2024</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5 text-indigo-600" />
              <h3 className="text-xl font-semibold text-gray-900">Tâches</h3>
            </div>
            <button 
              onClick={handleAddTask}
              className="inline-flex items-center px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter une tâche
            </button>
          </div>
          <ul className="space-y-3">
            {project.tasks.map((task) => (
              <li key={task.id}>
                <TaskItem task={task} refetchFunction={refetch} />
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
              onClick={handleAddComment}
              className="inline-flex items-center px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter un commentaire
            </button>
          </div>
          <CommentList comments={project.comments} />
        </div>
      </div>
    </div>
  );
};