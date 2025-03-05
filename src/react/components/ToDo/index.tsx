"use client";

import React, { Key, useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { ToDoItem } from "../../../types/ToDo";

const ToDo = () => {
  const [todos, setTodos] = useState<ToDoItem[]>([]);
  
  useEffect(() => {
    fetch('/api/todos')
      .then(response => response.json())
      .then((result) => {
        setTodos(result);
      })
      .catch((error: Error) => {
        console.error(error);
      });
    }, []);

  const handleFormSubmit = async (formData: FormData) => {
    const newTodo = {
      id: uuidv4(),
      message: formData.get("todoMessage"),
    } as ToDoItem;

    const response = await fetch("api/todos", {
      method: "POST",
      body: JSON.stringify(newTodo),
    });
    
    if (response.status === 200) {
      fetch('/api/todos')
        .then(response => response.json())
        .then((result) => {
          setTodos(result);
        })
        .catch((error: Error) => {
          console.error(error);
        });
    } else {
      alert("error");
    }
  }

  const handleDeleteToDo = async (id: Key) => {
    const response = await fetch(`api/todos/${id}`, {
      method: "DELETE",
    });
    
    if (response.status === 200) {
      fetch('/api/todos')
        .then(response => response.json())
        .then((result) => {
          setTodos(result);
        })
        .catch((error: Error) => {
          console.error(error);
        });
    } else {
      alert("error");
    }
  }

  return (
    <div className="container">
      <form action={handleFormSubmit}>
        <input type="text" name="todoMessage" id="todo-input" placeholder="Add a new todo..." />
        <button type="submit" id="add-todo">Add Me</button>
      </form>

      <ul id="todo-list">
        {todos.length > 0 && 
          todos.map(todo => {
            return (
              <li className="todo-item" key={todo.id}>
                {todo.message}
                <button onClick={() => handleDeleteToDo(todo.id)}>trash</button>
                </li>
            );
          }
        )}
      </ul>
    </div>
  );
}

export default ToDo;