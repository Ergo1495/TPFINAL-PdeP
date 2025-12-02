const TaskManager = require('./TaskManager');
const UI = require('./UI');


const taskManager = new TaskManager();
const ui = new UI(taskManager);
ui.start();
