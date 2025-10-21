import { IconButton, MenuContent, MenuRoot, MenuTrigger } from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"

import EditTodo from "../Todos/EditTodo"
import DeleteTodo from "../Todos/DeleteTodo"
import { ToDoPublic } from "../../client"


interface TodoActionMenuProps {
    todo: ToDoPublic
}

export const TodoActionMenu = ({ todo }: TodoActionMenuProps) => {
    return (
        <MenuRoot>
            <MenuTrigger asChild>
                <IconButton variant="ghost" color="inherit">
                    <BsThreeDotsVertical />
                </IconButton>
            </MenuTrigger>
            <MenuContent>
                <EditTodo todo={todo} />
                <DeleteTodo id={todo.id} />
            </MenuContent>
        </MenuRoot>
    )
}