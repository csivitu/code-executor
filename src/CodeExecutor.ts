import * as dotenv from 'dotenv';
import Bull from 'bull';

import { Code } from './models';

dotenv.config();

export default class CodeExecutor {
    private queue: Bull.Queue;

    constructor(name: string, redis: string) {
        this.queue = new Bull(name, redis);
    }

    async add(codeOptions: Code): Promise<void> {
        await this.queue.add(codeOptions);
    }
}

export { default as Worker } from './Worker';
