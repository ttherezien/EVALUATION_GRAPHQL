import { Circle, Clock, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client';


const UpdateTask = gql`
  mutation UpdateTask($taskId: Int!, $title: String, $status: String) {
    updateTask(taskId: $taskId, title: $title, status: $status) {
      id
      title
      status
      projectId
    }
  }
`;

const DeleteTask = gql`
  mutation DeleteTask($taskId: Int!) {
    deleteTask(taskId: $taskId) {
      id
    }
  }
`;



export const TaskItem = ({ task, refetchFunction, idOwner }) => {
  const statusConfig = {
    TODO: {
      icon: Circle,
      color: 'text-blue-500',
      bg: 'bg-blue-100',
      text: 'À faire'
    },
    IN_PROGRESS: {
      icon: Clock,
      color: 'text-orange-500',
      bg: 'bg-orange-100',
      text: 'En cours'
    },
    DONE: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-100',
      text: 'Terminé'
    }
  };

  const config = statusConfig[task.status];
  const StatusIcon = config.icon;

  const [taskTitle, setTaskTitle] = useState(task.title);
  const [taskStatus, setTaskStatus] = useState(task.status);



  const [modifyTask] = useMutation(UpdateTask, {
    variables: {
      taskId: task.id,
      title: taskTitle,
      status: taskStatus
    }
  });

  const [deleteTaskgql] = useMutation(DeleteTask, {
    variables: {
      taskId: task.id
    }
  });

  const modifyStatut = () => {
    let newStatus = taskStatus;
    if (taskStatus === 'TODO') {
      newStatus = 'IN_PROGRESS';
    } else if (taskStatus === 'IN_PROGRESS') {
      newStatus = 'DONE'; 
    } else if (taskStatus === 'DONE') {
      newStatus = 'TODO';
    }
    setTaskStatus(newStatus);
    modifyTask({
      variables: {
        taskId: task.id,
        title: taskTitle,
        status: newStatus
      }
    });

  }

  const deleteTask = (taskId) => {
    deleteTaskgql({
      variables: {
        taskId: taskId
      }
    }).then(() => {
      refetchFunction();
    });
  }

  const userId = localStorage.getItem('id');
  const userIdNumber = parseInt(userId, 10);


  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200 hover:bg-gray-700">
      <div className="flex items-center space-x-3">
        <StatusIcon className={`h-5 w-5 ${config.color} cursor-pointer hover:scale-110 transition-transform`} onClick={() => modifyStatut()} />
        <input 
          disabled={userIdNumber !== idOwner}
          className="text-gray-900 font-medium border border-white rounded-lg hover:border-gray-500 p-1" 
          value={taskTitle} 
          onChange={(e) => setTaskTitle(e.target.value)} 
          onBlur={() => modifyTask()} 
        />
      </div>

      <span className={`px-3 py-1 text-sm font-medium rounded-full cursor-pointer text-white hover:bg-red-100 hover:text-red-700`} onClick={() => deleteTask(task.id)}>
        Supprimer
      </span>

      <span className={`px-3 py-1 text-sm font-medium rounded-full cursor-pointer ${config.bg} ${config.color} hover:scale-110 transition-transform`} onClick={() => modifyStatut()} >
        {config.text}
      </span>
    </div>
  );
};
