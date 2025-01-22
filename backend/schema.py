import asyncio
from typing import List, AsyncGenerator
import strawberry
from strawberry import Schema
from strawberry.types import Info


from models import User, Project
from database import get_db

import jwt
from datetime import datetime, timedelta



algorithm = 'HS256'

SECRET_KEY = "your_very_secret_key"



@strawberry.type
class UserType:
    id: int
    email: str
    token : str = ""

@strawberry.type
class ProjectType:
    id: int
    name: str
    description: str
    owner_id: int


def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[algorithm])
        return payload
    except jwt.ExpiredSignatureError:
        raise Exception("Token has expired")
    except jwt.InvalidTokenError:
        raise Exception("Invalid token")

async def get_current_user(info: Info) -> UserType:
    auth_header = info.context['request'].headers.get('Authorization')
    if auth_header:
        token = auth_header.split(" ")[1]
        payload = verify_token(token)
        db = get_db()
        user = db.query(User).filter(User.id == payload['id']).first()
        if user:
            return UserType(id=user.id, email=user.email)
    raise Exception("Authentication required")




@strawberry.type
class Query:
    @strawberry.field
    async def users(self,info:Info) -> List[UserType]:
        await get_current_user(info)
        db=get_db()
        users = db.query(User).all()
        return [UserType(id=user.id, email=user.email) for user in users]
    
    @strawberry.field
    async def projects(self,info:Info) -> List[ProjectType]:
        user = await get_current_user(info)
        db=get_db()
        projects = db.query(Project).filter(Project.owner_id == user.id).all()
        return [ProjectType(id=project.id, name=project.name, description=project.description, owner_id=project.owner_id) for project in projects]
    
    @strawberry.field
    async def connexion(self, email: str, password: str) -> UserType:
        db=get_db()
        user = db.query(User).filter(User.email == email, User.password == password).first()
        return UserType(id=user.id, email=user.email)
        


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

    @strawberry.mutation
    async def signup(self, email: str, password: str) -> UserType:
        db=get_db()
        user = User(email=email, password=password)
        db.add(user)
        db.commit()
        payload = {
            'id': user.id,
            'email': user.email,
            'exp': datetime.utcnow() + timedelta(hours=1)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
        
        return UserType(id=user.id, email=user.email, token=token)

    @strawberry.mutation
    async def login(self, email: str, password: str) -> UserType:
        db=get_db()
        user = db.query(User).filter(User.email == email, User.password == password).first()
        if user:
            
            payload = {
            'id': user.id,
            'email': user.email,
            'exp': datetime.utcnow() + timedelta(hours=1)
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
            db.commit()
            
            return UserType(id=user.id, email=user.email,token=token)
        else:
            raise Exception("Invalid credentials")

    


@strawberry.type
class Subscription:
    @strawberry.subscription
    async def user_created() -> AsyncGenerator[UserType, None]:
        db = get_db()
        last_user_id = None
        while True:
            user = db.query(User).order_by(User.id.desc()).first()
            if user and user.id != last_user_id:
                last_user_id = user.id
                yield UserType(id=user.id, email=user.email)
            await asyncio.sleep(1)


    @strawberry.subscription
    async def latest_user() -> AsyncGenerator[UserType, None]:
        db = get_db()
        last_user_id = None
        while True:
            user = db.query(User).order_by(User.id.desc()).first()
            if user and user.id != last_user_id:
                last_user_id = user.id
                yield UserType(id=user.id, email=user.email)
            await asyncio.sleep(1)


