from fastapi import FastAPI
from strawberry.asgi import GraphQL

from schema import Schema, Query, Mutation, Subscription

app = FastAPI()

@app.get("/")
async def index():
    return {"message": "Welcome to the API, go to /graphql to interact with the API"}

schema = Schema(query=Query, mutation=Mutation, subscription=Subscription)

app.add_route("/graphql", GraphQL(schema))
