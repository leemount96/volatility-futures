import React, { useState } from 'react';
import './App.css';
import { AddTodoComponent } from './components/AddTodo';
import { ITodo, ITodos, TodosComponent } from './components/Todo';
import { TradeWindowComponent } from './components/TradeWindow';
import { ethers } from "ethers";

import { Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {

  const [data, setdata] = useState({
    address: "",
    Balance: "",
  })

  const metamaskHandler = () => {
    if(window.ethereum){
      window.ethereum.request({method: "eth_requestAccounts" })
      .then((res: any) => accountChangeHandler(res[0]))
    }else{
      alert("Please install metamask extension");
    }
  };

  const getBalance = (address: any) => {
    window.ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"]
    })
    .then((balance: any) => {
      setdata({
        address: address,
        Balance: ethers.utils.formatEther(balance),
      });
    });
  };

  const accountChangeHandler = (account: any) => {
    setdata({
      address: account,
      Balance: "",
    });

    getBalance(account);
  }

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
      <Card className = "float-mid">
        <Card.Header>
          <strong>Address: </strong>
          {data.address}
        </Card.Header>

        <Card.Body>
          <Card.Text>
            <strong>Balance: </strong>
            {data.Balance} ETH
          </Card.Text>

          <Button onClick={metamaskHandler} variant="primary" className="float-end">
            Connect to wallet
          </Button>
        </Card.Body>
        
      </Card>

      <AddTodoComponent addTodos={addTodos} />
      <hr />
      <TodosComponent
        todos={todos}
        toggleTodos={toggleTodos}
        deleteTodos={deleteTodos} />
      <TradeWindowComponent/>
    </div>
  )
}

export default App;
