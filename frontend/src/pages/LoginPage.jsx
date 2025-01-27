import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const loginMutation = gql`
    mutation login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
        email
        id
      }
   }`;

  const [login, { error }] = useMutation(loginMutation);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    const email = formData.email;
    const password = formData.password;
    e.preventDefault();
    try {
      const { data } = await login({
        variables: { email, password },
      });

      localStorage.setItem('token', data.login.token);
      localStorage.setItem('email', data.login.email);
      localStorage.setItem('id', data.login.id);

      if (localStorage.getItem('token') !== null) {
        navigate('/');
      }
    } catch (e) {
      return
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Connexion</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Se connecter
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Pas encore de compte ?{' '}
        <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
          Inscrivez-vous
        </Link>
      </p>
      {error && <p className="text-red-500 text-sm mt-4">Erreur lors de la connexion : {error.message}</p>}
    </div>
  );
}