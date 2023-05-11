import IdleQueue from './idleQueue';

const globalTaskQueue = new IdleQueue({ ensureTasksRun: true });

export default globalTaskQueue;