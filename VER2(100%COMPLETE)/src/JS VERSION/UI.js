const readline = require('readline');
const TaskManager = require('./TaskManager');
const Task = require('./Task');
const { ESTADOS, DIFICULTADES, EMOJIS_DIFICULTAD } = require('./types');

class UI {
  constructor(taskManager) {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.taskManager = taskManager;
  }

  
//Inicia la aplicación.
   
  async start() {
    await this.showMainMenu();
    this.close();
  }

  async showMainMenu() {
    console.log('\n=== MENÚ PRINCIPAL ===');
    console.log('1. Ver mis tareas');
    console.log('2. Buscar una tarea');
    console.log('3. Agregar una tarea');
    console.log('0. Salir');

    const option = await this.getValidNumber('Selecciona una opción: ', 0, 3);
    switch (option) {
      case 1:
        await this.showViewTasksMenu();
        break;
      case 2:
        await this.searchTask();
        break;
      case 3:
        await this.addTask();
        break;
      case 0:
        return;
    }
    await this.showMainMenu();
  }

  async showViewTasksMenu() {
    console.log('\n=== VER MIS TAREAS ===');
    console.log('1. Ver todas las tareas');
    console.log('2. Ver tareas pendientes');
    console.log('3. Ver tareas en curso');
    console.log('4. Ver tareas terminadas');
    console.log('5. Ver estadísticas');
    console.log('6. Ver tareas vencidas');
    console.log('7. Ver tareas de alta prioridad');
    console.log('0. Volver al menú principal');

    const option = await this.getValidNumber('Selecciona una opción: ', 0, 7);
    switch (option) {
      case 1:
        await this.listTasks(this.taskManager.getActiveTasks());
        break;
      case 2:
        await this.listTasks(this.taskManager.filterByEstado(ESTADOS.PENDIENTE));
        break;
      case 3:
        await this.listTasks(this.taskManager.filterByEstado(ESTADOS.EN_CURSO));
        break;
      case 4:
        await this.listTasks(this.taskManager.filterByEstado(ESTADOS.TERMINADA));
        break;
      case 5:
        this.showStats();
        await this.pressEnterToContinue();
        break;
      case 6:
        await this.listTasks(this.taskManager.getOverdueTasks());
        break;
      case 7:
        await this.listTasks(this.taskManager.getHighPriorityTasks());
        break;
      case 0:
        return;
    }
    await this.showViewTasksMenu();
  }

  async listTasks(tasks) {
    if (tasks.length === 0) {
      console.log('\nNo hay tareas que cumplan con los criterios.');
      await this.pressEnterToContinue();
      return;
    }

    const sorted = this.taskManager.sortTasks(tasks, 'titulo'); // Ordena por título por defecto
    console.log('\n=== LISTADO DE TAREAS ===');
    sorted.forEach((task, index) => {
      console.log(`${index + 1}. ${task.titulo} - ${task.estado} (${task.dificultad} ${EMOJIS_DIFICULTAD[task.dificultad]})`);
    });

    console.log('\nOpciones:');
    console.log('Selecciona un número para ver detalles.');
    console.log('0 - Volver al menú anterior');

    const num = await this.getValidNumber('Selecciona una opción: ', 0, sorted.length);
    if (num > 0) {
      await this.showTaskDetails(sorted[num - 1]);
      await this.listTasks(tasks);
    }
  }

  async showTaskDetails(task) {
    console.log('\n=== DETALLES DE LA TAREA ===');
    console.log(`ID: ${task.id}`);
    console.log(`Título: ${task.titulo}`);
    console.log(`Descripción: ${task.descripcion || 'Sin datos'}`);
    console.log(`Estado: ${task.estado}`);
    console.log(`Dificultad: ${task.dificultad} ${EMOJIS_DIFICULTAD[task.dificultad]}`);
    console.log(`Creación: ${task.creacion}`);
    console.log(`Última edición: ${task.ultimaEdicion}`);
    console.log(`Vencimiento: ${task.vencimiento || 'Sin datos'}`);
    console.log(`Relacionadas: ${task.relatedTasks.length > 0 ? task.relatedTasks.join(', ') : 'Ninguna'}`);

    console.log('\nOpciones:');
    console.log('E - Editar tarea');
    console.log('D - Eliminar tarea');
    console.log('R - Ver tareas relacionadas');
    console.log('0 - Volver al menú anterior');

    const input = await new Promise(resolve => this.rl.question('Selecciona una opción: ', resolve));
    if (input.toUpperCase() === 'E') {
      await this.editTask(task.id);
    } else if (input.toUpperCase() === 'D') {
      this.taskManager.deleteTask(task.id);
      console.log('✅ Tarea eliminada (soft delete).');
    } else if (input.toUpperCase() === 'R') {
      await this.listTasks(this.taskManager.getRelatedTasks(task.id));
    }
    await this.pressEnterToContinue();
  }

  async addTask() {
    console.log('\n=== AGREGAR TAREA ===');
    const titulo = await this.getValidString('Título: ', 100, false);
    const descripcion = await this.getValidString('Descripción: ', 500, true);
    const estado = await this.getEstadoSelection();
    const dificultad = await this.getDificultadSelection();
    const vencimiento = await this.getValidDate('Fecha de Vencimiento (YYYY-MM-DD): ');

    const task = new Task(titulo, descripcion, estado, dificultad, vencimiento);
    this.taskManager.addTask(task);
    console.log('✅ Tarea agregada y guardada exitosamente.');
    await this.pressEnterToContinue();
  }

  async editTask(id) {
    const task = this.taskManager.getActiveTasks().find(t => t.id === id);
    if (!task) return;

    const titulo = await this.getValidString(`Título actual: ${task.titulo}\nNuevo título: `, 100, true);
    const newTitulo = titulo || task.titulo;

    const descripcion = await this.getValidString(`Descripción actual: ${task.descripcion || 'Sin datos'}\nNueva descripción: `, 500, true);
    const newDescripcion = descripcion || task.descripcion;

    console.log(`Estado actual: ${task.estado}`);
    const estado = await this.getEstadoSelection();
    const newEstado = estado;

    console.log(`Dificultad actual: ${task.dificultad} ${EMOJIS_DIFICULTAD[task.dificultad]}`);
    const dificultad = await this.getDificultadSelection();
    const newDificultad = dificultad;

    const vencimiento = await this.getValidString(`Fecha de Vencimiento actual: ${task.vencimiento || 'Sin datos'}\nNueva fecha (YYYY-MM-DD): `, 10, true);
    const newVencimiento = vencimiento || task.vencimiento;

    this.taskManager.updateTask(task.id, {
      titulo: newTitulo,
      descripcion: newDescripcion,
      estado: newEstado,
      dificultad: newDificultad,
      vencimiento: newVencimiento
    });
    console.log('✅ Tarea editada exitosamente.');
    await this.pressEnterToContinue();
  }

  async searchTask() {
    const query = await this.getValidString('Ingresa el título a buscar: ', 100, false);
    const results = this.taskManager.searchByTitle(query);
    await this.listTasks(results);
  }

  showStats() {
  const stats = this.taskManager.getStats();

  console.log('\n=== ESTADÍSTICAS ===');
  console.log(`Total de tareas: ${stats.total}`);

  console.log(`Pendientes: ${stats.byEstado[ESTADOS.PENDIENTE].count}`);
  console.log(`En curso: ${stats.byEstado[ESTADOS.EN_CURSO].count}`);
  console.log(`Terminadas: ${stats.byEstado[ESTADOS.TERMINADA].count}`);
  console.log(`Canceladas: ${stats.byEstado[ESTADOS.CANCELADA].count}`);

  console.log(`Vencidas: ${this.taskManager.getOverdueTasks().length}`);
  console.log(`Alta prioridad: ${this.taskManager.getHighPriorityTasks().length}`);
}


  async getValidNumber(prompt, min, max) {
    while (true) {
      const input = await new Promise(resolve => this.rl.question(prompt, resolve));
      const num = parseInt(input);
      if (!isNaN(num) && num >= min && num <= max) {
        return num;
      }
      console.log(`Por favor, ingresa un número entre ${min} y ${max}.`);
    }
  }

  async getValidString(prompt, maxLength, allowEmpty) {
    while (true) {
      const input = await new Promise(resolve => this.rl.question(prompt, resolve));
      if (allowEmpty && input === '') return '';
      if (input.length > 0 && input.length <= maxLength) return input;
      console.log(`Por favor, ingresa un texto de hasta ${maxLength} caracteres${allowEmpty ? ' o vacío para mantener el actual' : ''}.`);
    }
  }

  async getEstadoSelection() {
    console.log('Estados disponibles:');
    const estados = Object.values(ESTADOS);
    estados.forEach((estado, index) => {
      console.log(`${index + 1}. ${estado}`);
    });
    const num = await this.getValidNumber('Selecciona un estado: ', 1, estados.length);
    return estados[num - 1];
  }

  async getDificultadSelection() {
    console.log('Dificultades disponibles:');
    const dificultades = Object.values(DIFICULTADES);
    dificultades.forEach((dificultad, index) => {
      console.log(`${index + 1}. ${dificultad} ${EMOJIS_DIFICULTAD[dificultad]}`);
    });
    const num = await this.getValidNumber('Selecciona una dificultad: ', 1, dificultades.length);
    return dificultades[num - 1];
  }

  async getValidDate(prompt) {
    while (true) {
      const input = await new Promise(resolve => this.rl.question(prompt, resolve));
      if (input === '') return null;
      const date = new Date(input);
      if (!isNaN(date.getTime())) return input;
      console.log('Por favor, ingresa una fecha válida en formato YYYY-MM-DD o vacío.');
    }
  }

  async pressEnterToContinue() {
    await new Promise(resolve => this.rl.question('Presiona Enter para continuar...', resolve));
  }

  close() {
    this.rl.close();
  }
}

module.exports = UI;
