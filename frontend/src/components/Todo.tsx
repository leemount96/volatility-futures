import React from "react";
import "./Todo.css";

export type ITodo = {
    id: number;
    title: string;
    completed: boolean;
  }
  
export type ITodos = {
    todos: ITodo[],
  }

export const TodosComponent: React.FC<{
    todos: ITodos,
    toggleTodos: (id: number) => void,
    deleteTodos: (id: number) => void
}> = ({todos, toggleTodos, deleteTodos}) => {
    const deleteTodo = (id: number) => {
        if (window.confirm(`Are you sure you want to delete this item?`)) {
            deleteTodos(id);
        }
    }
    return (
        <div className="section_todos">
            <h2>Todos</h2>
            {todos.todos.length ? <ul className="todos">
                {todos.todos.map(todo => (
                    <li key={todo.id}>
                        <span style={{textDecoration: todo.completed? 'line-through': 'none'}}>{todo.title}</span>
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodos(todo.id)} />
                        <button onClick={() => {deleteTodo(todo.id)}}>X</button>
                    </li>
                ))}
            </ul>: <div>No Todo has been created</div>}
        </div>
    )
}