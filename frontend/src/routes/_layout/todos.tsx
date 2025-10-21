import { TodosService } from '@/client/'
import { Container, EmptyState, Flex, Heading, Table, VStack } from "@chakra-ui/react"
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

import PendingTodos from '@/components/Pending/PendingTodos'
import { TodoActionMenu } from '@/components/Common/TodoActionMenu'
import AddTodo from '@/components/Todos/AddTodo'

import { PaginationItems, PaginationNextTrigger, PaginationPrevTrigger, PaginationRoot } from "@/components/ui/pagination.tsx"
import { FiCheckSquare, FiSearch, FiSquare } from 'react-icons/fi'

const todosSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 5

function getTodosQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      TodosService.readTodos({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ['todos', { page }],
  }
}

export const Route = createFileRoute('/_layout/todos')({
  component: Todos,
    validateSearch: (search) => todosSearchSchema.parse(search),
})

function TodosTable() {
    const navigate = useNavigate({ from: Route.fullPath })
    const { page } = Route.useSearch()

    const { data, isLoading, isPlaceholderData } = useQuery({
        ...getTodosQueryOptions({ page }),
        placeholderData: (prevData) => prevData,
    })
    
    const setPage = (page: number) =>
        navigate({
            search: (prev: { [key: string]: string }) => ({ ...prev, page }),
        })

    const todos = data?.data.slice(0, PER_PAGE) ?? []
    const count = data?.count ?? 0

    if (isLoading) {
        return <PendingTodos />
    }

    if (todos.length === 0) {
        return (
            <EmptyState.Root>
                <EmptyState.Content>
                    <EmptyState.Indicator>
                        <FiSearch />
                    </EmptyState.Indicator>
                    <VStack textAlign="center">
                        <EmptyState.Title>You don't have any todos yet</EmptyState.Title>
                        <EmptyState.Description>
                            Add a new todo to get started
                        </EmptyState.Description>
                    </VStack>
                </EmptyState.Content>
            </EmptyState.Root>
        )
    }

    return (
        <>
            <Table.Root size={{ base: "sm", md: "md" }}>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader w="sm">ID</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">ToDo</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Description</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Status</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {todos?.map((todo) => (
                        <Table.Row key={todo.id} opacity={isPlaceholderData ? 0.5 : 1}>
                            <Table.Cell truncate maxW="sm">
                                {todo.id}
                            </Table.Cell>
                            <Table.Cell truncate maxW="sm">
                                {todo.title}
                            </Table.Cell>
                            <Table.Cell truncate maxW="md">
                                {todo.description}
                            </Table.Cell>
                            <Table.Cell>
                                {todo.completed ? <FiCheckSquare/> : <FiSquare/>} 
                            </Table.Cell>
                            <Table.Cell>
                                <TodoActionMenu todo={todo} />
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
            <Flex justifyContent={"flex-end"} mt={4}>
                <PaginationRoot
                    count={count}
                    pageSize={PER_PAGE}
                    onPageChange={({ page }) => setPage(page)}
                >
                    <Flex>
                        <PaginationPrevTrigger />
                        <PaginationItems />
                        <PaginationNextTrigger />
                    </Flex>
                </PaginationRoot>
            </Flex>
        </>
    )
}

function Todos() {
    return (
        <Container maxW="full">
            <Heading size="lg" pt={12}>
                Your Todos
            </Heading>
            <AddTodo />
            <TodosTable />
        </Container>
    )
}