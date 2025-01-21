import asyncio
from typing import List, AsyncGenerator
import strawberry
from strawberry import Schema

from models import User, Project
from database import get_db

@strawberry.type
class UserType:
    id: int
    email: str

@strawberry.type
class ProjectType:
    id: int
    name: str
    description: str
    owner_id: int

@strawberry.type
class Query:
    @strawberry.field
    async def users(self) -> List[UserType]:
        db=get_db()
        users = db.query(User).all()
        return [UserType(id=user.id, email=user.email) for user in users]
    
    @strawberry.field
    async def projects(self) -> List[ProjectType]:
        db=get_db()
        projects = db.query(Project).all()
        return [ProjectType(id=project.id, name=project.name, description=project.description, owner_id=project.owner_id) for project in projects]
    


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def add_user(self, email: str, password: str) -> UserType:
        db=get_db()
        user = User(email=email, password=password)
        db.add(user)
        db.commit()
        return UserType(id=user.id, email=user.email)

    @strawberry.mutation
    async def add_project(self, name: str, description: str, owner_id: int) -> ProjectType:
        db=get_db()
        project = Project(name=name, description=description, owner_id=owner_id)
        db.add(project)
        db.commit()
        return ProjectType(id=project.id, name=project.name, description=project.description, owner_id=project.owner_id)

    


@strawberry.type
class Subscription:
    @strawberry.subscription
    async def new_user(self) -> AsyncGenerator[UserType, None]:
        db=get_db()
        while True:
            user = db.query(User).order_by(User.id.desc()).first()
            yield UserType(id=user.id, email=user.email)
            await asyncio.sleep(1)

    @strawberry.subscription
    async def new_project(self) -> AsyncGenerator[ProjectType, None]:
        db=get_db()
        while True:
            project = db.query(Project).order_by(Project.id.desc()).first()
            yield ProjectType(id=project.id, name=project.name, description=project.description, owner_id=project.owner_id)
            await asyncio.sleep(1)


schema = Schema(query=Query, mutation=Mutation, subscription=Subscription)