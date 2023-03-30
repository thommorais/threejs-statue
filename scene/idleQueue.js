import { now, rIC, cIC } from './utils';
import queueMicrotask from './queueMicrotask';

const DEFAULT_MIN_TASK_TIME = 0;

const isSafari_ = !!(typeof window.safari === 'object' && window.safari.pushNotification);

class IdleQueue {
    constructor({ ensureTasksRun = false, defaultMinTaskTime = DEFAULT_MIN_TASK_TIME } = {}) {
        this.idleCallbackHandle_ = null;
        this.taskQueue_ = [];
        this.isProcessing_ = false;
        this.state_ = null;
        this.defaultMinTaskTime_ = defaultMinTaskTime;
        this.ensureTasksRun_ = ensureTasksRun;

        this.runTasksImmediately = this.runTasksImmediately.bind(this);
        this.runTasks_ = this.runTasks_.bind(this);
        this.onVisibilityChange_ = this.onVisibilityChange_.bind(this);

        if (this.ensureTasksRun_) {
            addEventListener('visibilitychange', this.onVisibilityChange_, true);

            if (isSafari_) {
                addEventListener('beforeunload', this.runTasksImmediately, true);
            }
        }
    }

    pushTask(task, options) {
        this.addTask_(Array.prototype.push, task, options);
    }

    unshiftTask(task, options) {
        this.addTask_(Array.prototype.unshift, task, options);
    }

    runTasksImmediately() {
        this.runTasks_();
    }

    hasPendingTasks() {
        return this.taskQueue_.length > 0;
    }

    clearPendingTasks() {
        this.taskQueue_ = [];
        this.cancelScheduledRun_();
    }

    getState() {
        return this.state_;
    }

    destroy() {
        this.taskQueue_ = [];
        this.cancelScheduledRun_();

        if (this.ensureTasksRun_) {
            removeEventListener('visibilitychange', this.onVisibilityChange_, true);

            if (isSafari_) {
                removeEventListener('beforeunload', this.runTasksImmediately, true);
            }
        }
    }

    addTask_(arrayMethod, task, { minTaskTime = this.defaultMinTaskTime_ } = {}) {
        const state = {
            time: now(),
            visibilityState: document.visibilityState,
        };

        arrayMethod.call(this.taskQueue_, { state, task, minTaskTime });

        this.scheduleTasksToRun_();
    }

    scheduleTasksToRun_() {
        if (this.ensureTasksRun_ && document.visibilityState === 'hidden') {
            queueMicrotask(this.runTasks_);
        } else {
            if (!this.idleCallbackHandle_) {
                this.idleCallbackHandle_ = rIC(this.runTasks_);
            }
        }
    }

    runTasks_(deadline) {
        this.cancelScheduledRun_();

        if (!this.isProcessing_) {
            this.isProcessing_ = true;

            while (this.hasPendingTasks() && !shouldYield(deadline, this.taskQueue_[0].minTaskTime)) {
                const { task, state } = this.taskQueue_.shift();

                this.state_ = state;
                task(state);
                this.state_ = null;
            }

            this.isProcessing_ = false;

            if (this.hasPendingTasks()) {
                this.scheduleTasksToRun_();
            }
        }
    }

    cancelScheduledRun_() {
        if (this.idleCallbackHandle_) {
            cIC(this.idleCallbackHandle_);
            this.idleCallbackHandle_ = null;
        }
    }

    onVisibilityChange_() {
        if (document.visibilityState === 'hidden') {
            this.runTasks
            Immediately();
        }
    }
}

const shouldYield = (deadline, minTaskTime) => {
    if (deadline && deadline.timeRemaining() <= minTaskTime) {
        return true;
    }
    return false;
};

export default IdleQueue;

