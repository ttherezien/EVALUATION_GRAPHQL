from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
import strawberry

# Définir un schéma GraphQL avec Strawberry
@strawberry.type
class Query:
    hello: str = "Hello, world!"

schema = strawberry.Schema(query=Query)

# FastAPI App
app = FastAPI()

# Ajouter le routeur GraphQL
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

# Endpoint de test
@app.get("/")
def read_root():
    return {"message": "Bienvenue sur FastAPI avec GraphQL"}
