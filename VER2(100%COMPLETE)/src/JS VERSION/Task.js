const { v4: uuidv4 } = require('uuid');
const { DIFICULTADES } = require('./types');

class Task {
  
    constructor(titulo, descripcion, estado, dificultad, vencimiento) {
    this.id = uuidv4(); // ID único con UUID
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.estado = estado;
    this.dificultad = dificultad;
    this.creacion = this.getCurrentDate();
    this.ultimaEdicion = this.creacion;
    this.vencimiento = vencimiento;
    this.deleted = false;
    this.relatedTasks = []; // IDs de tareas relacionadas
  }

//Actualiza la tarea con nuevos valores (método puro en lógica).
   
  update(updates) {
    Object.assign(this, updates);
    this.ultimaEdicion = this.getCurrentDate();
  }

//Marca la tarea como eliminada (hard delete).
 hardDelete() {
    this.deleted = true;
  }

//Verifica si la tarea está vencida (predicado puro).
   
  isOverdue() {
    return this.vencimiento ? new Date(this.vencimiento) < new Date() : false;
  }

//Verifica si es de alta prioridad (predicado puro).
   
  isHighPriority() {
    return this.dificultad === DIFICULTADES.DIFICIL;
  }

//Agrega una tarea relacionada (método de comportamiento).
   
  addRelatedTask(taskId) {
    if (!this.relatedTasks.includes(taskId)) {
      this.relatedTasks.push(taskId);
    }
  }

  getCurrentDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
}

module.exports = Task;