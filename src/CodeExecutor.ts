import * as dotenv from 'dotenv';
import Bull from 'bull';

import { Code } from './models';

dotenv.config();

export default class CodeExecutor {
    private redis: string;

    private name: string;

    constructor(name: string, redis: string) {
        this.redis = redis;
        this.name = name;
    }

    private queue = (() => new Bull(this.name, this.redis))();

    async add(codeOptions: Code): Promise<void> {
        await this.queue.add(codeOptions);
    }
}

export { default as Worker } from './Worker';
