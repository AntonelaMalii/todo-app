const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const emptyMsg = document.getElementById('empty-msg');

let tasks = loadTasks();

render();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ id: Date.now(), text, done: false });
  save();
  render();
  input.value = '';
});

function render() {
  list.innerHTML = '';

  if (tasks.length === 0) {
    emptyMsg.classList.add('visible');
    return;
  }
  emptyMsg.classList.remove('visible');

  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => toggle(task.id));

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEdit(task.id, li, span, editBtn));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    li.append(checkbox, span, editBtn, deleteBtn);
    list.appendChild(li);
  });
}

function startEdit(id, li, span, editBtn) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'edit-input';
  editInput.value = task.text;
  editInput.maxLength = 200;

  editBtn.textContent = 'Save';
  editBtn.className = 'btn-edit btn-save';

  span.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  const commit = () => {
    const newText = editInput.value.trim();
    if (newText) {
      task.text = newText;
      save();
    }
    render();
  };

  editBtn.onclick = commit;
  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') render();
  });
}

function toggle(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.done = !task.done;
    save();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  save();
  render();
}

function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem('tasks')) || [];
  } catch {
    return [];
  }
}
