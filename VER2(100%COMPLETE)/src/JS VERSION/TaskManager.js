const fs = require('fs');
const Task = require('./Task');
const { ESTADOS, DIFICULTADES } = require('./types');

class TaskManager {
  constructor() {
    this.tasks = [];
    this.taskFile = 'tasks.json';
    this.loadTasks();
  }

  //Agrega una nueva tarea (no pura, modifica estado).
  
  addTask(task) {
    this.tasks.push(task);
    this.saveTasks();
  }

//Edita una tarea por ID.

  editTask(id, updates) {
    const task = this.tasks.find(t => t.id === id && !t.deleted);
    if (task) {
      task.update(updates);
      this.saveTasks();
      return true;
    }
    return false;
  }

//Elimina una tarea (soft delete).
   
  deleteTask(id) {
    const task = this.tasks.find(t => t.id === id && !t.deleted);
    if (task) {
      task.softDelete();
      this.saveTasks();
      return true;
    }
    return false;
  }

//Obtiene tareas activas (no eliminadas) - función pura.
  
  getActiveTasks() {
    return this.tasks.filter(task => !task.deleted);
  }

//Filtra tareas por estado - función pura.
  
  filterByEstado(estado) {
    return this.getActiveTasks().filter(task => task.estado === estado);
  }

//Busca tareas por título - función pura.
   
  searchByTitle(query) {
    const q = query.toLowerCase().trim();
    return q ? this.getActiveTasks().filter(task => task.titulo.toLowerCase().includes(q)) : [];
  }

//Ordena tareas por atributo - función pura.
   
sortTasks(tasks, sortBy) {
    return [...tasks].sort((a, b) => {
      if (sortBy === 'titulo') return a.titulo.localeCompare(b.titulo);
      if (sortBy === 'vencimiento') return (a.vencimiento || '').localeCompare(b.vencimiento || '');
      if (sortBy === 'creacion') return a.creacion.localeCompare(b.creacion);
      if (sortBy === 'dificultad') return a.dificultad.localeCompare(b.dificultad);
      return 0;
    });
  }

//Obtiene estadísticas - función pura.
   
  getStats() {
    const active = this.getActiveTasks();
    const total = active.length;
    const byEstado = {};
    Object.values(ESTADOS).forEach(estado => {
      const count = active.filter(t => t.estado === estado).length;
      byEstado[estado] = { count, percentage: total > 0 ? (count / total) * 100 : 0 };
    });
    const byDificultad = {};
    Object.values(DIFICULTADES).forEach(dif => {
      const count = active.filter(t => t.dificultad === dif).length;
      byDificultad[dif] = { count, percentage: total > 0 ? (count / total) * 100 : 0 };
    });
    return { total, byEstado, byDificultad };
  }

 //Obtiene tareas de alta prioridad - función pura.
  
  getHighPriorityTasks() {
    return this.getActiveTasks().filter(task => task.isHighPriority());
  }

//Obtiene tareas relacionadas a una tarea - función pura.
   
  getRelatedTasks(id) {
    const task = this.tasks.find(t => t.id === id && !t.deleted);
    return task?.relatedTasks?.map(relId => this.tasks.find(t => t.id === relId && !t.deleted)).filter(Boolean) || [];
  }

//Obtiene tareas vencidas - función pura.
   
  getOverdueTasks() {
    return this.getActiveTasks().filter(task => task.isOverdue());
  }

  saveTasks() {
    try {
      fs.writeFileSync(this.taskFile, JSON.stringify(this.tasks, null, 2));
    } catch (error) {
      console.log('Error al guardar tareas:', error.message);
    }
  }

  loadTasks() {
    try {
      if (fs.existsSync(this.taskFile)) {
        const data = fs.readFileSync(this.taskFile, 'utf8');
        const loaded = JSON.parse(data);
        this.tasks = loaded.map(t => Object.assign(new Task('', '', '', '', null), t));
        console.log(`Cargadas ${this.tasks.length} tareas desde ${this.taskFile}.`);
      } else {
        console.log('Archivo de tareas no encontrado, iniciando con lista vacía.');
      }
    } catch (error) {
      console.log('Error al cargar tareas, iniciando con lista vacía:', error.message);
    }
  }
}

module.exports = TaskManager;