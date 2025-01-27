from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.asgi import GraphQL

from schema import Schema, Query, Mutation, Subscription

app = FastAPI()

# Configurer CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Origines autorisées
    allow_credentials=True,                  # Autoriser les cookies/headers d'authentification
    allow_methods=["*"],                     # Méthodes autorisées (GET, POST, etc.)
    allow_headers=["*"],                     # Headers autorisés
)

@app.get("/")
async def index():
    return {"message": "Welcome to the API, go to /graphql to interact with the API"}

schema = Schema(query=Query, mutation=Mutation, subscription=Subscription)

app.add_route("/graphql", GraphQL(schema))
app.add_websocket_route("/subscription", GraphQL(schema))

