import Runner from './Runner';
import { Job, SchedulerOptions } from './models';

const queueMaxSize = 50;

export default class Scheduler {
    private readonly runner: Runner;

    private readonly size: number;

    private queue: Array<Job>;

    constructor(runner: Runner, options?: SchedulerOptions) {
        this.runner = runner;
        this.size = options ? options.size : queueMaxSize;
        this.queue = [];
    }

    addJob(tag: string, code: string, options?: object): boolean {
        const opts = options || {};
        if (this.queue.length === this.size) {
            return false;
        }

        this.queue.push({ tag, code, options: opts });
        return true;
    }

    dispatchJob(): Job {
        if (this.queue.length === 0) {
            return {
                tag: '',
                code: '',
            };
        }
        return this.queue.shift();
    }

    pendingJobs(): Array<Job> {
        return this.queue;
    }

    start() {
        console.log(this.queue);
    }
}
