const readline = require('readline');
const TaskManager = require('./TaskManager');
const Task = require('./Task');

class UI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.taskManager = new TaskManager();
  }

  async start() {
    await this.showMainMenu();
    this.close();
  }

  async showMainMenu() {
    console.log('\n=== MENU PRINCIPAL ===');
    console.log('1. Ver mis tareas');
    console.log('2. Buscar una tarea');
    console.log('3. Agregar una tarea');
    console.log('0. Salir');

    const option = await this.getValidNumber('Selecciona una opción: ', 0, 3);
    switch (option) {
      case 1:
        await this.showViewTaskMenu();
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

  async showViewTaskMenu() {
    console.log('\n=== VER TAREAS ===');
    console.log('1. Ver todas las tareas');
    console.log('2. Ver tareas pendientes');
    console.log('3. Ver tareas en curso');
    console.log('4. Ver tareas terminadas');
    console.log('5. Ver estadísticas');
    console.log('6. Ver tareas vencidas');
    console.log('0. Volver');

    const option = await this.getValidNumber('Selecciona una opción: ', 0, 6);
    switch (option) {
      case 1:
        await this.listTasks(this.taskManager.getActiveTasks());
        break;
      case 2:
        await this.listTasks(this.taskManager.filterByEstado('Pendiente'));
        break;
      case 3:
        await this.listTasks(this.taskManager.filterByEstado('En Curso'));
        break;
      case 4:
        await this.listTasks(this.taskManager.filterByEstado('Terminada'));
        break;
      case 5:
        this.showStats();
        await this.pressEnterToContinue();
        break;
      case 6:
        await this.listTasks(this.taskManager.getOverdueTasks());
        break;
      case 0:
        return;
    }
    await this.showViewTaskMenu();
  }

  async listTasks(tasks) {
    if (tasks.length === 0) {
      console.log('No hay tareas.');
      await this.pressEnterToContinue();
      return;
    }

    const sorted = this.taskManager.sortByTitle(tasks);
    console.log('\n=== LISTADO DE TAREAS ===');
    sorted.forEach((task, index) => {
      console.log(`${index + 1}. ${task.titulo} - ${task.estado} (${task.dificultad})`);
    });

    const num = await this.getValidNumber('Selecciona un número (0 para volver): ', 0, sorted.length);
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
    console.log(`Dificultad: ${task.dificultad}`);
    console.log(`Creación: ${task.creacion}`);
    console.log(`Última edición: ${task.ultimaEdicion}`);
    console.log(`Vencimiento: ${task.vencimiento || 'Sin datos'}`);

    const action = await this.getValidString('E para editar, D para eliminar, 0 para volver: ', 1, true);
    if (action.toUpperCase() === 'E') {
      await this.editTask(task.id);
    } else if (action.toUpperCase() === 'D') {
      this.taskManager.deletedTask(task.id);
      console.log('Eliminada.');
    }
    await this.pressEnterToContinue();
  }

  async addTask() {
    const titulo = await this.getValidString('Título: ', 100, false);
    const descripcion = await this.getValidString('Descripción: ', 500, true);
    const estado = await this.getEstadoSelection();
    const dificultad = await this.getDificultadSelection();
    const vencimiento = await this.getValidDate('Fecha de vencimiento (YYYY-MM-DD): ');

    const task = new Task(titulo, descripcion, estado, dificultad, vencimiento);
    this.taskManager.addTask(task);
    console.log('Tarea agregada.');
    await this.pressEnterToContinue();
  }

  async editTask(id) {
    const task = this.taskManager.getActiveTasks().find(t => t.id === id);
    if (!task) return;

    const titulo = await this.getValidString(`Título (${task.titulo}): `, 100, true);
    const descripcion = await this.getValidString(`Descripción (${task.descripcion || 'Sin datos'}): `, 500, true);
    const estado = await this.getEstadoSelection();
    const dificultad = await this.getDificultadSelection();
    const vencimiento = await this.getValidDate(`Vencimiento (${task.vencimiento || 'Sin datos'}): `);

    this.taskManager.editTask(id, { titulo, descripcion, estado, dificultad, vencimiento });
    console.log('Tarea editada.');
    await this.pressEnterToContinue();
  }

  async searchTask() {
    const query = await this.getValidString('Buscar por título: ', 100, true);
    const results = this.taskManager.searchByTitle(query);
    await this.listTasks(results);
  }

  showStats() {
    const stats = this.taskManager.getStats();
    console.log('\n=== ESTADÍSTICAS ===');
    console.log(`Total: ${stats.total}`);
    console.log('Por estado:', stats.byEstado);
    console.log('Por dificultad:', stats.byDificultad);
  }

  async getValidNumber(prompt, min, max) {
    return new Promise(resolve => {
      this.rl.question(prompt, input => {
        const num = parseInt(input);
        if (isNaN(num) || num < min || num > max) {
          console.log(`Número entre ${min} y ${max}.`);
          resolve(this.getValidNumber(prompt, min, max));
        } else {
          resolve(num);
        }
      });
    });
  }

  async getValidString(prompt, maxLength, allowEmpty) {
    return new Promise(resolve => {
      this.rl.question(prompt, input => {
        const text = input.trim();
        if (!allowEmpty && text.length === 0) {
          console.log('No puede estar vacío.');
          resolve(this.getValidString(prompt, maxLength, allowEmpty));
        } else if (text.length > maxLength) {
          console.log(`Máximo ${maxLength} caracteres.`);
          resolve(this.getValidString(prompt, maxLength, allowEmpty));
        } else {
          resolve(text);
        }
      });
    });
  }

  async getValidDate(prompt) {
    return new Promise(resolve => {
      this.rl.question(prompt, input => {
        const trimmed = input.trim();
        if (!trimmed) {
          resolve(null);
          return;
        }
        const date = new Date(trimmed);
        if (isNaN(date)) {
          console.log('FECHA INVALIDA');
          resolve(this.getValidDate(prompt));
        } else {
          resolve(trimmed);
        }
      });
    });
  }

  async getEstadoSelection() {
    console.log('Estados: 1. Pendiente 2. En Curso 3. Terminada 4. Cancelada');
    const num = await this.getValidNumber('Selecciona: ', 1, 4);
    const estados = ['Pendiente', 'En Curso', 'Terminada', 'Cancelada'];
    return estados[num - 1];
  }

  async getDificultadSelection() {
    console.log('\nDificultades: 1. Fácil 2. Medio 3. Difícil');
    const num = await this.getValidNumber('Selecciona: ', 1, 3);
    const dificultades = ['Facil', 'Medio', 'Dificil'];
    return dificultades[num - 1];
  }

  async pressEnterToContinue() {
    await new Promise(resolve => this.rl.question('\nPresiona Enter...', resolve));
  }

  close() {
    this.rl.close();
  }
}

module.exports = UI;
