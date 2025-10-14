import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import ToDo, ToDoCreate, ToDoPublic, ToDoUpdate, ToDosPublic, Message

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("/", response_model=ToDosPublic)
def read_todos(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve todos.
    """

    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(ToDo)
        count = session.exec(count_statement).one()
        statement = select(ToDo).offset(skip).limit(limit)
        todos = session.exec(statement).all()
    else:
        count_statement = (
            selecct(ToDo)
            .where(ToDo.owner_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(ToDo)
            .where(ToDo.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        todos = session.exec(statement).all()

    return ToDosPublic(data=todos, count=count)

@router.get("/{id}", response_model=ToDoPublic)
def read_todo(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get todo by ID.
    """
    todo = session.get(ToDo, id)
    if not todo:
        raise HTTPException(status_code=404, detail="ToDo not found")
    if not current_user.is_superuser and (todo.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return todo

@router.post("/", response_model=ToDoPublic)
def create_todo(
    *, session: SessionDep, current_user: CurrentUser, todo_in: ToDoCreate
) -> Any:
    """
    Create new todo.
    """
    todo = ToDo.model_validate(todo_in, update={"owner_id": current_user.id})
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo

@router.put("/{id}", response_model=ToDoPublic)
def update_todo(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    todo_in: ToDoUpdate,
) -> Any:
    """
    Update a todo.
    """
    todo = session.get(ToDo, id)
    if not todo:
        raise HTTPException(status_code=404, detail="ToDo not found")
    if not current_user.is_superuser and (todo.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = todo_in.model_dump(exclude_unset=True)
    todo.sqlmodel_update(update_dict)
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo

@router.delete("/{id}")
def delete_todo(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete a todo.
    """
    todo = session.get(ToDo, id)
    if not todo:
        raise HTTPException(status_code=404, detail="ToDo not found")
    if not current_user.is_superuser and (todo.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(todo)
    session.commit()
    return Message(message="ToDo deleted successfully")