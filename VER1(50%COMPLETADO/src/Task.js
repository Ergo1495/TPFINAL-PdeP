class Task {
  constructor(titulo, descripcion, estado, dificultad, vencimiento) {
    this.id = 0; // ID numérico simple
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.estado = estado;
    this.dificultad = dificultad;
    this.creacion = this.getCurrentDate();
    this.ultimaEdicion = this.creacion;
    this.vencimiento = vencimiento || null;
    this.deleted = false; // Soft delete básico
  }

  // Actualiza la tarea
  update(updates) {
    const { titulo, descripcion, estado, dificultad, vencimiento } = updates;
    Object.assign(this, { titulo, descripcion, estado, dificultad, vencimiento });
    this.ultimaEdicion = this.getCurrentDate();
  }

  // Marca como eliminada
  softDelete() {
    this.deleted = true;
  }

  // Verifica si está vencida
  isOverdue() {
    if (!this.vencimiento) return false;
    return new Date(this.vencimiento) < new Date();
  }

  getCurrentDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
}

module.exports = Task;
