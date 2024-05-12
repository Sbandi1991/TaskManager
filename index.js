const express = require('express');

const bodyParser = require('body-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');



const app = express();

const path = require('path');

const DATA_FILE = 'taskDetails.json';


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

const port = 7000;
app.listen('7000',()=>{ 
    console.log('App is listening port 7000')
  })


  app.get('/', (req, res) => {
	res.sendFile(path.join(process.cwd(), 'public', 'views', 'index.html'));
  });

  app.post('/api/addtask',(req,res)=>{
    res.setHeader('Content-Type', 'application/json');
    const taskData = req.body;
    taskData.taskId = generateUniqueId();

  fs.readFile(DATA_FILE, (err, data) => {
    if (err) {
      sendError(res, err);
      return;
    }
    let taskList = [];

    
        if (data) {
            taskList = JSON.parse(data);
        }
        if (!Array.isArray(taskList)) {
            taskList = [];
        }         

    taskList.push(taskData);

    //let tasks = JSON.parse(taskData.toString()); // Convert data to string before parsing JSON
    fs.writeFile(DATA_FILE, JSON.stringify(taskList), (err, task) => {
        if (err) {
          console.log(res, err);
        } else {
            console.log('Task added successfully...!');
        }
      });
})
  })

  app.get('/api/gettasks',(req,res)=>{
    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
          sendError(res, err);
          return;
        }
        const tasks = JSON.parse(data); // Parse the existing JSON data
        res.json(tasks); // Send the tasks data as JSON response
      });
  })

  function generateUniqueId() {
    return uuidv4();
}

app.get('/api/gettask/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
            sendError(res, err);
            return;
        }
        const tasks = JSON.parse(data);
        const task = tasks.find(t => t.taskId === taskId);
        if (task) {
            res.json(task);
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    });
});

// Route to update a task by ID
app.put('/api/updatetask/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    const updatedTask = req.body;

    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
            sendError(res, err);
            return;
        }
        let tasks = JSON.parse(data);
        const index = tasks.findIndex(t => t.taskId === taskId);
        if (index !== -1) {
            tasks[index] = updatedTask;
            fs.writeFile(DATA_FILE, JSON.stringify(tasks), (err) => {
                if (err) {
                    sendError(res, err);
                    return;
                }
                res.json({ message: 'Task updated successfully' });
            });
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    });
});
// Route to delete a task by ID
app.delete('/api/deletetask/:taskId', (req, res) => {
    const taskId = req.params.taskId;

    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
            sendError(res, err);
            return;
        }
        let tasks = JSON.parse(data);
        const index = tasks.findIndex(t => t.taskId === taskId);
        if (index !== -1) {
            tasks.splice(index, 1);
            fs.writeFile(DATA_FILE, JSON.stringify(tasks), (err) => {
                if (err) {
                    sendError(res, err);
                    return;
                }
                res.json({ message: 'Task deleted successfully' });
            });
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    });
});

function sendError(res, err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
}
function sendError(res, err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
}

