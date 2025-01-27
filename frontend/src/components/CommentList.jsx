import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";

const GET_USERS_BY_IDS = gql`
  query GetUsersByIds($ids: [Int!]!) {
    getUsersByIds(ids: $ids) {
      id
      email
    }
  }
`;




export const CommentList = ({ comments }) => {
  if (!comments || !comments.length) {
    return (
      <p className="text-center text-gray-500 italic">
        Aucun commentaire pour le moment.
      </p>
    );
  }

  // Extraire tous les IDs uniques des auteurs
  const authorIds = [...new Set(comments.map((c) => c.authorId).filter(Boolean))];

  // Récupérer les utilisateurs en une seule requête
  const { data, loading, error } = useQuery(GET_USERS_BY_IDS, {
    variables: { ids: authorIds },
    skip: authorIds.length === 0,  // Empêche la requête si aucun ID
  });

  // Si la requête est en cours de chargement, on affiche un message
  if (loading) {
    return (
      <p className="text-center text-gray-500 italic">
        Chargement des commentaires...
      </p>
    );
  }

  // Si la requête a échoué, on affiche un message d'erreur
  if (error) {
    return (
      <p className="text-center text-red-500 italic">
        Une erreur est survenue lors du chargement des utilisateurs.
      </p>
    );
  }

  // Créer un dictionnaire { id: email }
  const authorMap = data?.getUsersByIds.reduce((acc, user) => {
    if (user && user.id) {
      acc[user.id] = user.email;
    }
    return acc;
  }, {}) || {};


  
  return (
    <div className="space-y-4">
      {comments.map((comment) => {
      const authorEmail = authorMap[comment.authorId] || "Unknown";

      return (
        <div
          key={comment.id}  // Vérifie que comment.id ne change pas d'une manière imprévisible
          className="group bg-white/60 backdrop-blur-sm rounded-xl p-4 hover:shadow-lg transition-all duration-300 border border-gray-200/50 hover:border-indigo-200/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
              {authorEmail[0]?.toUpperCase() || ""}
            </div>
            <div className="text-sm font-medium text-gray-600">
              {authorEmail}
            </div>
          </div>
          <div className="text-gray-800 pl-10">{comment.content}</div>
        </div>
      );
    })}
    </div>
  );
};
