const tasks = [
    { id: 1, text: "Підготувати звіт", status: "assigned" },
    { id: 2, text: "Завершити макет", status: "in-progress" },
    { id: 3, text: "Відправити лист", status: "completed" },
    { id: 4, text: "Підготувати презентацію", status: "assigned" }
];

// Функція для відображення завдань на сторінці
function loadTasks(filter = "all") {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach(task => {
        if (filter === "all" || task.status === filter) {
            const li = document.createElement("li");
            li.textContent = task.text;
            taskList.appendChild(li);
        }
    });
}

// Визначаємо фільтр зі сторінки
const page = window.location.pathname;
if (page.includes("tasks")) loadTasks("all");
if (page.includes("assigned")) loadTasks("assigned");
if (page.includes("in-progress")) loadTasks("in-progress");
if (page.includes("completed")) loadTasks("completed");
