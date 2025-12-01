const fs = require('fs');
const Task = require('./Task');

class TaskManager {
  constructor() {
    this.tasks = [];
    this.taskFile = 'tasks.json';
    this.loadTasks();
  }

  addTask(task) {
    task.id = this.tasks.length + 1;
    this.tasks.push(task);
    this.saveTasks();
  }

  editTask(id, updates) {
    const task = this.tasks.find(t => t.id === id && !t.deleted);
    if (task) {
      task.update(updates);
      this.saveTasks();
      return true;
    }
    return false;
  }

  deletedTask(id) {
    const task = this.tasks.find(t => t.id === id && !t.deleted);
    if (task) {
      task.softDelete();
      this.saveTasks();
      return true;
    }
    return false;
  }

  getActiveTasks() {
    return this.tasks.filter(t => !t.deleted);
  }

  filterByEstado(estado) {
    return this.getActiveTasks().filter(t => t.estado === estado);
  }

  searchByTitle(query) {
    const q = query.toLowerCase().trim();
    return q ? this.getActiveTasks().filter(t => t.titulo.toLowerCase().includes(q)) : [];
  }

  sortByTitle(tasks) {
    return [...tasks].sort((a, b) => a.titulo.localeCompare(b.titulo));
  }

  getStats() {
    const active = this.getActiveTasks();
    const total = active.length;

    const byEstado = {};
    ['Pendiente', 'En Curso', 'Terminada', 'Cancelada'].forEach(estado => {
      byEstado[estado] = active.filter(t => t.estado === estado).length;
    });

    const byDificultad = {};
    ['Facil', 'Medio', 'Dificil'].forEach(dif => {
      byDificultad[dif] = active.filter(t => t.dificultad === dif).length;
    });

    return { total, byEstado, byDificultad };
  }

  getOverdueTasks() {
    return this.getActiveTasks().filter(t => t.isOverdue());
  }

  saveTasks() {
    try {
      fs.writeFileSync(this.taskFile, JSON.stringify(this.tasks, null, 2));
    } catch (error) {
      console.log('Error al guardar:', error.message);
    }
  }

  loadTasks() {
    try {
      if (fs.existsSync(this.taskFile)) {
        const data = fs.readFileSync(this.taskFile, 'utf8');
        const loaded = JSON.parse(data);
        this.tasks = loaded.map(t => Object.assign(new Task('', '', '', '', null), t));
        console.log(`Cargadas ${this.tasks.length} tareas.`);
      } else {
        console.log('Archivo no encontrado, lista vacía.');
      }
    } catch (error) {
      console.log('Error al cargar:', error.message);
    }
  }
}

module.exports = TaskManager;
