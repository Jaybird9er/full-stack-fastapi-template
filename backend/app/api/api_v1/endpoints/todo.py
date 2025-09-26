from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from uuid import UUID

from app import crud
from app.api import deps
from app.models import ToDo, ToDoCreate, ToDoUpdate, ToDoPublic, User
from app.api.deps import CurrentUser, SessionDep

router = APIRouter(tags=["todos"])

@router.post("/", response_model=ToDoPublic)
def create_todo(*, session: SessionDep, current_user: CurrentUser, todo_in: ToDoCreate) -> Any:
    """
    Create new ToDo item.
    """
    todo = ToDo.model_validate(todo_in, update={"owner_id": current_user.id})
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo

# @router.post("/", response_model=ToDoPublic)
# def create_todo(
#     todo_in: ToDoCreate,
#     db: Session = Depends(deps.get_db),
#     current_user: User = Depends(deps.get_current_user),
# ):
#     return crud.create_todo(session=db, todo_in=todo_in, owner_id=current_user.id)

@router.get("/", response_model=list[ToDoPublic])
def read_todos(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    return crud.get_todos_by_user(session=db, owner_id=current_user.id)

@router.get("/{todo_id}", response_model=ToDoPublic)
def read_todo(
    todo_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    todo = crud.get_todo(session=db, todo_id=todo_id, owner_id=current_user.id)
    if not todo:
        raise HTTPException(status_code=404, detail="ToDo not found")
    return todo

@router.put("/{todo_id}", response_model=ToDoPublic)
def update_todo(
    todo_id: UUID,
    todo_in: ToDoUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    todo = crud.get_todo(session=db, todo_id=todo_id, owner_id=current_user.id)
    if not todo:
        raise HTTPException(status_code=404, detail="ToDo not found")
    return crud.update_todo(session=db, db_todo=todo, todo_in=todo_in)

@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    todo = crud.get_todo(session=db, todo_id=todo_id, owner_id=current_user.id)
    if not todo:
        raise HTTPException(status_code=404, detail="ToDo not found")
    crud.delete_todo(session=db, db_todo=todo)
