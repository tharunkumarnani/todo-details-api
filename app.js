const express = require("express");
const app = express();
app.use(express.json());
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at 3000");
    });
  } catch (e) {
    console.log(`Database error Msg:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// 1.get all todos whose status is 'TO DO'

app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;

  const getTodoStatusQuery = `
  select * from todo where todo like '%${search_q}%' and status like '${status}%' and priority like '%${priority}%';
  `;
  const todosArray = await db.all(getTodoStatusQuery);
  response.send(todosArray);
});

//2.get todo by id

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    select * from todo where id=${todoId}`;
  const todoArray = await db.get(getTodoQuery);
  response.send(todoArray);
});

//3.create a todo

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;

  const createTodoQuery = `
  insert into todo (id,todo,priority,status)
  values (${id},'${todo}','${priority}','${status}');`;
  const dbResponse = await db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

//4. update todo api

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const data = request.body;
  const getPreviousTodoData = `
    select * from todo where id=${todoId};`;
  const previousData = await db.get(getPreviousTodoData);
  let { todo, status, priority } = previousData;

  const todoValue = data.todo === undefined ? todo : data.todo;
  const statusValue = data.status === undefined ? status : data.status;
  const priorityValue = data.priority === undefined ? priority : data.priority;
  const getUpdatedName = (bodyObject) => {
    if (bodyObject.todo !== undefined) {
      return "Todo Updated";
    } else if (bodyObject.status !== undefined) {
      return "Status Updated";
    } else if (bodyObject.priority !== undefined) {
      return "Priority Updated";
    } else {
      return "Todo Updated";
    }
  };

  const updateTodoQuery = `
  update todo
  set todo='${todoValue}',
        priority='${priorityValue}',
        status='${statusValue}'
        
    where id=${todoId};`;
  const dbResponse = await db.run(updateTodoQuery);
  const whichOneUpdating = getUpdatedName(data);
  response.send(whichOneUpdating);
});

//5.delete Todo api

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    delete from todo where id=${todoId};`;
  const dbResponse = await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
