import Bull from 'bull';

import { Code } from './models/models';
import Worker from './Worker';

export default class CodeExecutor {
    private queue: Bull.Queue;

    private worker: Worker;

    constructor(name: string, redis: string) {
        this.queue = new Bull(name, redis);
    }

    async add(codeOptions: Code): Promise<void> {
        await this.queue.add(codeOptions);
    }

    async on(): Promise<void> {
        this.queue.on('completed', (job) => {
            this.worker.result(job);
        });
    }
}

export { default as Worker } from './Worker';
