import React from 'react';
import './App.css';
import { AddTodoComponent } from './components/AddTodo';
import { ITodo, ITodos, TodosComponent } from './components/Todo';

function App() {
  const [todos, setTodos] = React.useState<ITodos>({todos: []});
  const addTodos = (title: string) => {
    setTodos({
      todos: [
        {title, completed: false, id: todos.todos.length+1},
        ...todos.todos
      ]
    });
  };
  const deleteTodos = (id: number) => {
    setTodos({
      todos: todos.todos.filter(t => t.id !== id)
    });
  };
  const toggleTodos = (id: number) => {
    setTodos({
      todos: todos.todos.map(todo => todo.id === id ? {...todo, completed: !todo.completed} : todo)
    });
  }

  return (
    <div className="App">
      <AddTodoComponent addTodos={addTodos} />
      <hr />
      <TodosComponent
        todos={todos}
        toggleTodos={toggleTodos}
        deleteTodos={deleteTodos} />
    </div>
  )
}

export default App;
