document.addEventListener("DOMContentLoaded", function () {
  const inputEl = document.getElementById("todoInput");
  const addBtn = document.getElementById("addBtn");
  const listEl = document.getElementById("todoList");
  const filters = document.querySelectorAll(".filter-btn");
  const statsTotal = document.getElementById("totalTasks");
  const statsDone = document.getElementById("completedTasks");

  let tasks = JSON.parse(localStorage.getItem("todos")) || [];
  let currentFilter = "all";

  render();
  updateStats();

  addBtn.addEventListener("click", addTask);
  inputEl.addEventListener("keypress", function (e) {
    if (e.key === "Enter") addTask();
  });

  filters.forEach((f) =>
    f.addEventListener("click", function () {
      filters.forEach((x) => x.classList.remove("active"));
      this.classList.add("active");
      currentFilter = this.dataset.filter;
      render();
    })
  );

  function addTask() {
    const txt = inputEl.value.trim();
    if (!txt) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    tasks.push({
      id: Date.now(),
      text: txt,
      completed: false,
      time: time,
      edited: null,
    });

    save();
    render();
    updateStats();
    inputEl.value = "";
    inputEl.focus();
  }

  function delTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    save();
    render();
    updateStats();
  }

  function toggleDone(id) {
    tasks = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    save();
    render();
    updateStats();
  }

  function editTask(id) {
    const item = document.querySelector(`.todo-item[data-id="${id}"]`);
    if (!item) return;
    const textDiv = item.querySelector(".todo-text");
    const old = textDiv.textContent;
    const inp = document.createElement("input");
    inp.type = "text";
    inp.value = old;
    inp.className = "edit-input";

    textDiv.replaceWith(inp);
    inp.focus();

    inp.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        const v = inp.value.trim();
        if (!v) {
          render();
          return;
        }
        const now = new Date();
        const editedTime = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        tasks = tasks.map((t) =>
          t.id === id ? { ...t, text: v, edited: editedTime } : t
        );
        save();
        render();
        updateStats();
      } else if (e.key === "Escape") {
        render();
      }
    });

    inp.addEventListener("blur", function () {
      render();
    });
  }

  function render() {
    const shown = tasks.filter((t) => {
      if (currentFilter === "active") return !t.completed;
      if (currentFilter === "completed") return t.completed;
      return true;
    });

    if (shown.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-clipboard-list"></i>
          <p>No ${currentFilter !== "all" ? currentFilter : ""} tasks found.</p>
        </div>`;
      return;
    }

    listEl.innerHTML = shown
      .map(
        (t) => `
      <div class="todo-item ${t.completed ? "completed" : ""}" data-id="${
          t.id
        }">
        <div class="todo-checkbox ${
          t.completed ? "checked" : ""
        }" onclick="toggleDone(${t.id})"></div>
        <div class="todo-content">
          <div class="todo-text">${escapeHtml(t.text)}</div>
          <div class="todo-time">
            Added at ${t.time}
            ${
              t.edited
                ? `<span class="edited-time">(edited at ${t.edited})</span>`
                : ""
            }
          </div>
        </div>
        <div class="todo-actions">
          <button onclick="editTask(${
            t.id
          })" title="Edit"><i class="fas fa-edit"></i></button>
          <button onclick="delTask(${
            t.id
          })" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>`
      )
      .join("");
  }

  function updateStats() {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    statsTotal.textContent = `Всего: ${total} ${
      total === 1 ? "задача" : "задач"
    }`;
    statsDone.textContent = `Выполнено: ${done}`;
  }

  function save() {
    localStorage.setItem("todos", JSON.stringify(tasks));
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  window.delTask = delTask;
  window.toggleDone = toggleDone;
  window.editTask = editTask;
});
