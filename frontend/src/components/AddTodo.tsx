import React from 'react';

export const AddTodoComponent = ({addTodos}: {addTodos: (text: string) => void}) => {
    const [todo, setTodo] = React.useState<string>("");
    const submit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if(!todo) {
            alert("Please enter a todo item");
        } else {
            addTodos(todo);
            setTodo("");
        }
    };
    return (
        <div className="addTodo">
            <form>
                <input
                    value={todo}
                    onChange={e => {setTodo(e.target.value)}} />
                <button onClick={submit}>Add</button>    
            </form>
        </div>
    )
}