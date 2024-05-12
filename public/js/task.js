// Wait for the DOM content to be fully loaded before executing the script
document.addEventListener("DOMContentLoaded", function () {
  // Get the "Add Task" button and add a click event listener to it
  const addTaskBtn = document.getElementById("addTaskBtn");
  addTaskBtn.addEventListener("click", addTask);

  // Get the "Search" button and add a click event listener to it
  const searchBtn = document.getElementById("searchTXT");
  searchBtn.addEventListener("click", filterTasks);

  // Display tasks when the page is loaded
  displayTasks();
});

// Function to add a new task
function addTask() {
  // Get input values from the form
  const taskDescriptionInput = document.getElementById("taskdescription");
  const assignedToInput = document.getElementById("assignedto");
  const priorityDropdown = document.getElementById("Priority");
  const dueDateInput = document.getElementById("dueDate");
  const statusDropdown = document.getElementById("Status");

  // Extract values from inputs
  const taskDescription = taskDescriptionInput.value;
  const assignedTo = assignedToInput.value;
  const priority = priorityDropdown.value;
  const dueDate = dueDateInput.value;
  const status = statusDropdown.value;

  // Check if all fields are filled
  if (taskDescription && assignedTo && priority && dueDate && status) {
    // Create a new task object
    const task = {
      description: taskDescription,
      assignedTo: assignedTo,
      priority: priority,
      dueDate: dueDate,
      status: status
    };

    // Send POST request to the server
    fetch('/api/addtask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(task)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Clear input fields after successful addition
      taskDescriptionInput.value = "";
      assignedToInput.value = "";
      priorityDropdown.selectedIndex = 0;
      dueDateInput.value = "";
      statusDropdown.selectedIndex = 0;
      // Reload tasks from server or update UI as needed

      displayTasks(); // Assuming fetchTasks is a function that fetches and displays tasks
    })
    .catch(error => {
      console.error('Error:', error);
     // alert('An error occurred. Please try again later.');
    });
  } else {
    // Alert user to fill in all fields if any are missing
    alert("Please fill in all the fields.");
  }
}


// Function to display tasks
function displayTasks() {
  // Get the task list container
  const taskList = document.getElementById("taskList");

  // Clear the existing task list
  taskList.innerHTML = "";

  // Fetch tasks from the server
  fetch('/api/gettasks')
    .then(response => response.json())
    .then(tasks => {
      // Loop through each task and create HTML elements to display them
      tasks.forEach((task, index) => {
        const taskItem = document.createElement("tr");
        taskItem.innerHTML = `
              <td>${task.description}</td>
              <td>${task.assignedTo}</td>
              <td>${task.priority}</td>
              <td>${task.dueDate}</td>
              <td>${task.status}</td>
              <td>
                <button onclick="editTask('${task.taskId}')" class="btn-edit"">Edit</button>
                <button onclick="deleteTask('${task.taskId}')" class="btn-delete">Delete</button>
              </td>
          `;
        taskList.appendChild(taskItem);
      });
    })
    .catch(error => {
      console.error('Error fetching tasks:', error);
    });
}


// Function to edit a task
// Function to edit a task
async function editTask(taskId) {
  try {
    // Fetch task data from the server based on task ID
    const response = await fetch(`/api/gettask/${taskId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch task data');
    }
    const task = await response.json();

    // Prompt user to enter updated task details
    const updatedDescription = prompt("Enter updated description:", task.description);
    const updatedAssignedTo = prompt("Enter updated assigned to:", task.assignedTo);
    const updatedPriority = prompt("Enter updated priority:", task.priority);
    const updatedDueDate = prompt("Enter updated due date:", task.dueDate);
    const updatedStatus = prompt("Enter updated status:", task.status);

    // Update task details if all fields are filled
    if (updatedDescription && updatedAssignedTo && updatedPriority && updatedDueDate && updatedStatus) {
      const updatedTask = {
        ...task,
        description: updatedDescription,
        assignedTo: updatedAssignedTo,
        priority: updatedPriority,
        dueDate: updatedDueDate,
        status: updatedStatus
      };

      // Send PUT request to update the task on the server
      const updateResponse = await fetch(`/api/updatetask/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTask)
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update task');
      }

      // Display updated tasks
      displayTasks();
    } else {
      // Alert user to fill in all fields if any are missing
      alert("Please fill in all the fields.");
    }
  } catch (error) {
    console.error('Error editing task:', error);
    alert('An error occurred while editing the task. Please try again later.');
  }
}


function deleteTask(index) {
  // Send a DELETE request to the server's API endpoint
  fetch(`/api/deletetask/${index}`, {
      method: 'DELETE',
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      // Reload tasks from server or update UI as needed
      displayTasks();
  })
  .catch(error => {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
  });
}
// Function to filter tasks based on search text
// Function to filter tasks based on search text
async function filterTasks() {
  try {
    // Get the search text input value and convert it to lowercase
    const searchText = document.getElementById("searchText").value.toLowerCase();

    // Fetch tasks from the server
    const response = await fetch('/api/gettasks');
    if (!response.ok) {
      throw new Error('Failed to fetch tasks from server');
    }
    const tasks = await response.json();

    // Filter tasks based on whether any task property contains the search text
    const filteredTasks = tasks.filter((task) => {
      return Object.values(task).some((value) => {
        return value.toLowerCase().includes(searchText);
      });
    });

    // Display filtered tasks
    displayFilteredTasks(filteredTasks);
  } catch (error) {
    console.error('Error filtering tasks:', error);
    alert('An error occurred while filtering tasks. Please try again later.');
  }
}


// Function to display filtered tasks
function displayFilteredTasks(filteredTasks) {
  // Get the task list container
  const taskList = document.getElementById("taskList");

  // Clear the existing task list
  taskList.innerHTML = "";

  // Loop through each filtered task and create HTML elements to display them
  filteredTasks.forEach((task, index) => {
    const taskItem = document.createElement("tr");
    taskItem.innerHTML = `
          <td>${task.description}</td>
          <td>${task.assignedTo}</td>
          <td>${task.priority}</td>
          <td>${task.dueDate}</td>
          <td>${task.status}</td>
          <td>
          <button onclick="editTask('${task.taskId}')" class="btn-edit"">Edit</button>
          <button onclick="deleteTask('${task.taskId}')" class="btn-delete">Delete</button>
          </td>
      `;
    taskList.appendChild(taskItem);
  });
}
