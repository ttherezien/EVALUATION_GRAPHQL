import asyncio
from typing import List, AsyncGenerator, Optional
import strawberry
from strawberry import Schema
from strawberry.types import Info


from models import User, Project, Task, Comment
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
    
   
@strawberry.type
class TaskType:
    id: int
    title: str
    status: str
    project_id: int
    
    
@strawberry.type
class CommentType:
    id: int
    content: str
    author_id: int
    project_id: int  
   
 
@strawberry.type
class ProjectDetail:
    id: int
    name: str
    description: str
    owner: UserType
    tasks: List[TaskType]
    comments: List[CommentType]
    


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
        await get_current_user(info)
        db=get_db()
        projects = db.query(Project).all()
        return [ProjectType(id=project.id, name=project.name, description=project.description, owner_id=project.owner_id) for project in projects]
    
    @strawberry.field
    async def getUser(self,info:Info) -> UserType:
        user = await get_current_user(info)
        return user
    
    @strawberry.field
    async def getProject(self, id: int,info : Info) -> ProjectDetail:
        await get_current_user(info)
        db = get_db()
        project = db.query(Project).filter(Project.id == id).first()
        
        if not project:
            raise Exception(f"Project with ID {id} not found")

        if project and (project.owner_id):
            owner = db.query(User).filter(User.id == project.owner_id).first()
            tasks = db.query(Task).filter(Task.project_id == project.id).all()
            comments = db.query(Comment).filter(Comment.project_id == project.id).all()
            return ProjectDetail(id=project.id, name=project.name, description=project.description, owner=UserType(id=owner.id, email=owner.email), tasks=[TaskType(id=task.id, title=task.title, status=task.status, project_id=task.project_id) for task in tasks], comments=[CommentType(id=comment.id, content=comment.content, author_id=comment.author_id, project_id=comment.project_id) for comment in comments])
        else:
            raise Exception("Project not found")
        
    @strawberry.field
    async def get_user_by_id(self, id: int,info : Info) -> UserType:
        await get_current_user(info)
        db = get_db()
        user = db.query(User).filter(User.id == id).first()
        if not user:
            raise Exception(f"User with ID {id} not found")
        return UserType(id=user.id, email=user.email)
    
    @strawberry.field
    async def get_all_projects(self,info: Info) -> List[ProjectType]:
        await get_current_user(info)
        db = get_db()
        projects = db.query(Project).all()
        return [ProjectType(id=project.id, name=project.name, description=project.description, owner_id=project.owner_id) for project in projects]
    
    @strawberry.field
    async def get_users_by_ids(self, ids: List[int],info:Info) -> List[UserType]:
        await get_current_user(info)
        db = get_db()
        users = db.query(User).filter(User.id.in_(ids)).all()
        return [UserType(id=user.id, email=user.email) for user in users]
    
    
    
    
@strawberry.type
class Mutation:
    @strawberry.mutation
    async def signup(self, email: str, password: str) -> UserType:
        db=get_db()
        user = User(email=email, password=password)
        db.add(user)
        db.commit()
        payload = {
            'id': user.id,
            'email': user.email,
            'exp': datetime.utcnow() + timedelta(hours=10)
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
            'exp': datetime.utcnow() + timedelta(seconds=3600)
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
            db.commit()
            
            return UserType(id=user.id, email=user.email,token=token)
        else:
            raise Exception("Invalid credentials")
        
    @strawberry.mutation
    async def create_project(self, name: str, description: str, info: Info) -> ProjectType:
        user = await get_current_user(info)
        db=get_db()
        project = Project(name=name, description=description, owner_id=user.id)
        db.add(project)
        db.commit()
        return ProjectType(id=project.id, name=project.name, description=project.description, owner_id=project.owner_id)

    @strawberry.mutation
    async def create_task(self, project_id: int, title: str, status: str, info: Info) -> TaskType:
        user = await get_current_user(info)
        db = get_db()
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise Exception("Project not found")
        if project.owner_id != user.id:
            raise Exception("You do not have permission to add tasks to this project")
        task = Task(title=title, status=status, project_id=project_id)
        db.add(task)
        db.commit()
        return TaskType(id=task.id, title=task.title, status=task.status, project_id=task.project_id)

    @strawberry.mutation
    async def update_project(
        self,
        project_id: int,
        info: Info,
        name: Optional[str] = None,
        description: Optional[str] = None
    ) -> ProjectType:
        
        print("update_project")
        user = await get_current_user(info)
        db = get_db()

        project = db.query(Project).filter(Project.id == project_id, Project.owner_id == user.id).first()
        if not project:
            raise Exception("Project not found or you do not have permission to update this project")

        # Mise à jour uniquement des champs fournis
        if name is not None:
            project.name = name
        if description is not None:
            project.description = description

        db.commit()
        db.refresh(project)

        return ProjectType(id=project.id, name=project.name, description=project.description, owner_id=project.owner_id)

    @strawberry.mutation
    async def update_task(
        self,
        task_id: int,
        info: Info,
        title: Optional[str] = None,
        status: Optional[str] = None
    ) -> TaskType:
        user = await get_current_user(info)
        db = get_db()

        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise Exception("Task not found")

        project = db.query(Project).filter(Project.id == task.project_id).first()
        if not project or project.owner_id != user.id:
            raise Exception("Project not found or you do not have permission to update this task")

        if title is not None:
            task.title = title
        if status is not None:
            task.status = status

        db.commit()
        db.refresh(task)

        return TaskType(id=task.id, title=task.title, status=task.status, project_id=task.project_id)
    
    
    @strawberry.mutation
    async def delete_task(self, task_id: int, info: Info) -> TaskType:
        user = await get_current_user(info)
        db = get_db()
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise Exception("Task not found")
        project = db.query(Project).filter(Project.id == task.project_id).first()
        if not project or project.owner_id != user.id:
            raise Exception("Project not found or you do not have permission to delete this task")
        db.delete(task)
        db.commit()
        return TaskType(id=task.id, title=task.title, status=task.status, project_id=task.project_id)


    @strawberry.mutation
    async def delete_project(self, project_id: int, info: Info) -> ProjectType:
        """
        Supprimer un projet
        ainsi que toutes les tâches et les commentaires associés
        """
        user = await get_current_user(info)
        db = get_db()
        project = db.query(Project).filter(Project.id == project_id).first()
        
        if not project:
            raise Exception("Project not found")
        if project.owner_id != user.id:
            raise Exception("You do not have permission to delete this project")
        tasks = db.query(Task).filter(Task.project_id == project_id).all()
        comments = db.query(Comment).filter(Comment.project_id == project_id).all()
        
        for task in tasks:
            db.delete(task)
        for comment in comments:
            db.delete(comment)
        db.delete(project)
        db.commit()
        return ProjectType(id=project.id, name=project.name, description=project.description, owner_id=project.owner_id)
        
    @strawberry.mutation
    async def create_comment(self, project_id: int, content: str, info: Info) -> CommentType:
        user = await get_current_user(info)
        db = get_db()
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise Exception("Project not found")
        comment = Comment(content=content, author_id=user.id, project_id=project_id)
        db.add(comment)
        db.commit()
        return CommentType(id=comment.id, content=comment.content, author_id=comment.author_id, project_id=comment.project_id) 
    



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
            
            
    @strawberry.subscription
    async def comment_added(self, project_id: int) -> AsyncGenerator[CommentType, None]:
        print("comment_added")
        db = get_db()
        last_comment_id = None
        while True:
            comment = db.query(Comment).filter(Comment.project_id == project_id).order_by(Comment.id.desc()).first()
            if comment and comment.id != last_comment_id:
                last_comment_id = comment.id
                yield CommentType(id=comment.id, content=comment.content, author_id=comment.author_id, project_id=comment.project_id)
            await asyncio.sleep(1)
    


