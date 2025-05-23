export class Child {
    constructor(name) {
      this.name = name;
      this.points = 0;
      this.tasks = [];
    }
  
    addTask(task, icon = null, time = null, video = null) {
        this.tasks.push({ task, icon, time, video, done: false });
      }
  
    markTaskDone(taskName) {
      const task = this.tasks.find(t => t.task === taskName && !t.done);
      if (task) {
        task.done = true;
        this.points += 10;
      }
    }
  
    unmarkTask(taskName) {
      const task = this.tasks.find(t => t.task === taskName && t.done);
      if (task) {
        task.done = false;
        this.points -= 10;
        if (this.points < 0) this.points = 0;
      }
    }
  
    getInfo() {
      return `${this.name} har ${this.points} poäng.`;
    }
  }
  