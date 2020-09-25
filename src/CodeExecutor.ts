import Bull, {Job} from 'bull';

import { Code } from './models/models';

export default class CodeExecutor {
    private queue: Bull.Queue;

    constructor(name: string, redis: string) {
        this.queue = new Bull(name, redis);
    }

    async add(codeOptions: Code): Promise<void> {
        await this.queue.add(codeOptions);
    }

    on(event: string , cb: (job: Job, result: object) => void) {
        this.queue.on(event, cb);
    }
}

export { default as Worker } from './Worker';
