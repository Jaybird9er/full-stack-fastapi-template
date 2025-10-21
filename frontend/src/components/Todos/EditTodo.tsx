import { Button, ButtonGroup, DialogActionTrigger, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { type ApiError, type ToDoPublic, TodosService } from "../../client";
import { SubmitHandler, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { FaExchangeAlt } from "react-icons/fa";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";
import { DialogRoot, DialogBody, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog";
import { Field } from "../ui/field";

interface EditTodoProps {
    todo: ToDoPublic
}

interface TodoUpdateForm {
    title: string
    description?: string
    completed?: boolean
}

const EditTodo = ({ todo }: EditTodoProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TodoUpdateForm>({
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            ...todo,
            description: todo.description ?? undefined,
        },
    })

    const mutation = useMutation({
        mutationFn: (data: TodoUpdateForm) =>
            TodosService.updateTodo({ id: todo.id, requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Todo updated successfully.")
            reset()
            setIsOpen(false)
        },
        onError: (err: ApiError) => {
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] })
        },
    })

    const onSubmit: SubmitHandler<TodoUpdateForm> = async (data) => {
        mutation.mutate(data)
    }

    return (
        <DialogRoot
            size={{ base: "xs", md: "md" }}
            placement="center"
            open={isOpen}
            onOpenChange={({ open }) => setIsOpen(open)}       >
            <DialogTrigger asChild>
                <Button variant="ghost">
                    <FaExchangeAlt fontSize="16px" />
                    Edit Todo
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Edit Todo</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text mb={4}>Update the todo details below.</Text>
                        <VStack gap={4}>
                            <Field
                                required
                                invalid={!!errors.title}
                                errorText={errors.title?.message}
                                label="Title"
                            >
                                <Input
                                    id="title"
                                    {...register("title", {
                                        required: "Title is required",
                                    })}
                                    placeholder="Todo"
                                    type="text"
                                    />
                            </Field>
                            <Field
                                invalid={!!errors.description}
                                errorText={errors.description?.message}
                                label="Description"
                            >
                                <Input
                                    id="description"
                                    {...register("description")}
                                    placeholder="Description"
                                    type="text"
                                    />
                            </Field>
                        </VStack>
                    </DialogBody>
                    <DialogFooter gap={2}>
                        <ButtonGroup>
                            <DialogActionTrigger asChild>
                                <Button
                                    variant="subtle"
                                    colorPalette="gray"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                            </DialogActionTrigger>
                            <Button
                                variant="solid"
                                type="submit"
                                loading={isSubmitting}
                            >
                                Save
                            </Button>
                        </ButtonGroup>
                    </DialogFooter>
                </form>
            </DialogContent>
        </DialogRoot>
    )
}

export default EditTodo