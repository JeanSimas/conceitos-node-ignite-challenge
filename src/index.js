const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(usr => usr.username === username)
  if (!user)
    return response.status(400).json({ error: 'User not found' })
  request.user = user
  next()
}

function getTodo(request, response, next) {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(td => td.id === id)
  if (!todo)
    return response.status(404).json({ error: 'Todo not found' })
  request.todo = todo
  next()
}

app.post('/users', (request, response) => {
  const { username, name } = request.body

  const user = users.find(user => user.username === username)
  if (user)
    return response.status(400).json({ error: 'User already exists' })
  const newUser = { id: uuidv4(), username, name, todos: [] }
  users.push(newUser)
  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, getTodo, (request, response) => {
  const { todo } = request
  console.log(todo);
  const { title, deadline } = request.body

  if (title) todo.title = title
  if (deadline) todo.deadline = deadline
  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, getTodo, (request, response) => {
  const { todo } = request
  const { id } = request.params
  todo.done = true
  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, getTodo, (request, response) => {
  const { todo } = request
  const { user } = request
  user.todos.splice(todo, 1)
  return response.status(204).json(user.todos)
});

module.exports = app;