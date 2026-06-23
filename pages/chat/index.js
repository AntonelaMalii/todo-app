import { useEffect, useState } from 'react';

export default function Chat() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  // Load tasks from localStorage + start session refresh timer
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tasks')) || [];
      setTasks(saved);
    } catch {}

    const interval = setInterval(async () => {
      const res = await fetch('/api/refresh', { method: 'POST' });
      if (!res.ok) setSessionExpired(true);
    }, 45 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Persist tasks to localStorage on every change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setTasks((prev) => [...prev, { id: Date.now(), text, done: false }]);
    setInput('');
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const saveEdit = (id) => {
    const text = editText.trim();
    if (text) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, text } : t))
      );
    }
    setEditingId(null);
    setEditText('');
  };

  if (sessionExpired) {
    return (
      <div className="expired-overlay">
        <p>Your session has expired.</p>
        <button onClick={() => window.parent.location.reload()}>
          Reload page
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>To-Do List</h1>

      <form onSubmit={addTask}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new task..."
          autoComplete="off"
          maxLength={200}
        />
        <button type="submit">Add</button>
      </form>

      <ul id="task-list">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`task-item${task.done ? ' done' : ''}`}
          >
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleTask(task.id)}
            />

            {editingId === task.id ? (
              <input
                type="text"
                className="edit-input"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit(task.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                autoFocus
              />
            ) : (
              <span className="task-text">{task.text}</span>
            )}

            {editingId === task.id ? (
              <button
                className="btn-edit btn-save"
                onClick={() => saveEdit(task.id)}
              >
                Save
              </button>
            ) : (
              <button
                className="btn-edit"
                onClick={() => {
                  setEditingId(task.id);
                  setEditText(task.text);
                }}
              >
                Edit
              </button>
            )}

            <button className="btn-delete" onClick={() => deleteTask(task.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <p id="empty-msg" className="visible">
          No tasks yet. Add one above!
        </p>
      )}
    </div>
  );
}
