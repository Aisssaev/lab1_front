// // Отримуємо посилання на елементи
// const taskInput = document.getElementById("taskInput");
// const addTaskBtn = document.getElementById("addTaskBtn");
// const taskList = document.getElementById("taskList");
//
// // Завантажуємо список із localStorage
// document.addEventListener("DOMContentLoaded", loadTasks);
// addTaskBtn.addEventListener("click", addTask);
//
// // Функція додавання завдання
// function addTask() {
//     const taskText = taskInput.value.trim();
//     if (taskText === "") return;
//
//     // Створюємо об'єкт завдання
//     const task = {
//         id: Date.now(),
//         text: taskText,
//         completed: false
//     };
//
//     // Додаємо в список
//     addTaskToDOM(task);
//     saveTask(task);
//     taskInput.value = "";
// }
//
// // Функція додавання завдання в DOM
// function addTaskToDOM(task) {
//     const li = document.createElement("li");
//     li.dataset.id = task.id;
//     if (task.completed) li.classList.add("completed");
//
//     li.innerHTML = `
//         <span class="task-text">${task.text}</span>
//         <button class="complete-btn">✔</button>
//         <button class="delete-btn">✖</button>
//     `;
//
//     // Додаємо обробники подій
//     li.querySelector(".complete-btn").addEventListener("click", () => toggleTaskCompletion(task.id));
//     li.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task.id));
//
//     taskList.appendChild(li);
// }
//
// // Функція збереження завдання у localStorage
// function saveTask(task) {
//     let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//     tasks.push(task);
//     localStorage.setItem("tasks", JSON.stringify(tasks));
// }
//
// // Функція завантаження завдань із localStorage
// function loadTasks() {
//     let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//     tasks.forEach(task => addTaskToDOM(task));
// }
//
// // Функція позначення завдання як виконаного
// function toggleTaskCompletion(taskId) {
//     let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//     tasks = tasks.map(task => {
//         if (task.id == taskId) task.completed = !task.completed;
//         return task;
//     });
//     localStorage.setItem("tasks", JSON.stringify(tasks));
//     updateTaskList();
// }
//
// // Функція видалення завдання
// function deleteTask(taskId) {
//     let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//     tasks = tasks.filter(task => task.id != taskId);
//     localStorage.setItem("tasks", JSON.stringify(tasks));
//     updateTaskList();
// }
//
// // Функція оновлення списку завдань в DOM
// function updateTaskList() {
//     taskList.innerHTML = "";
//     loadTasks();
// }

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("todo-form")
    const input = document.getElementById("todo-input")
    const todoList = document.getElementById("todo-list")

    const tasks = JSON.parse(localStorage.getItem("tasks")) || []

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks))
    }

    function renderTasks() {
        todoList.innerHTML = ""
        tasks.forEach((task, index) => {
            const li = document.createElement("li")
            li.className = "task"
            li.innerHTML = `
            <div class="task-content">
                <span class="${task.completed ? "completed" : ""}" title="${task.text}">${task.text}</span>
            </div>
            <svg class="delete-icon" viewBox="0 0 24 24" width="24" height="24">
                <path d="M3 6h18v2H3V6m2.46 11.22c.11.53.58.94 1.13.94h10.82c.55 0 1.02-.41 1.13-.94L20 8H4l1.46 9.22M5.5 8h13l-1.16 7.35H6.66L5.5 8m3.5 2v5h2v-5h-2m4 0v5h2v-5h-2z"/>
            </svg>
        `

            li.querySelector("span").addEventListener("click", () => toggleTask(index))
            li.querySelector(".delete-icon").addEventListener("click", () => deleteTask(index))

            todoList.appendChild(li)
        })
    }

    function addTask(text) {
        tasks.push({ text, completed: false })
        saveTasks()
        renderTasks()
    }

    function toggleTask(index) {
        tasks[index].completed = !tasks[index].completed
        saveTasks()
        renderTasks()
    }

    function deleteTask(index) {
        tasks.splice(index, 1)
        saveTasks()
        renderTasks()
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault()
        const text = input.value.trim()
        if (text) {
            addTask(text)
            input.value = ""
        }
    })

    renderTasks()
})