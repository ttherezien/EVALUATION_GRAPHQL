import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';



// Lien HTTP pour requêtes et mutations
const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql',
});

// Lien WebSocket pour les subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:8000/subscription', // Remplacez par wss:// pour HTTPS
    connectionParams: () => {
      const token = localStorage.getItem('token');
      return {
        Authorization: token ? `Bearer ${token}` : '', // Ajout du token pour WebSocket
      };
    },
    reconnect: true,
  })
);

// SplitLink pour diriger les opérations vers HTTP ou WebSocket
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink, // WebSocket pour les subscriptions
  httpLink // HTTP pour requêtes et mutations
);

// Lien pour ajouter l'en-tête d'autorisation (HTTP uniquement)
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Gestion des erreurs
const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.message === 'Token has expired') {
        localStorage.removeItem('token');
        window.location.href = '/login'; // Redirection en cas d'expiration du token
      }
    }
  }
});

// Client Apollo
const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(splitLink)), // Combine liens et gestion des erreurs
  cache: new InMemoryCache(), // Cache Apollo
});

// Rendu de l'application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>
);
