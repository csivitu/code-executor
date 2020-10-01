import Bull from 'bull';
import { v4 as uuid } from 'uuid';

import { CodeParams, Result } from './models/models';
import logger from './utils/logger';
import { extension } from './utils/findExtension';

const languages = Object.keys(extension);

export default class CodeExecutor {
    private queue: Bull.Queue;

    private jobs: Map<string, { resolve: Function, reject: Function }>;

    constructor(name: string, redis: string) {
        this.queue = new Bull(name, redis);

        this.jobs = new Map();

        this.queue.on('global:completed', (_job: Bull.Job, result: string) => {
            const { id } = <Result>JSON.parse(result);

            logger.debug(`Running on complete for id: ${id}`);

            const currentJob = this.jobs.get(id);
            if (currentJob) {
                currentJob.resolve(result);
                this.jobs.delete(id);
            }
        });
    }

    async runCode(codeOptions: CodeParams): Promise<void> {
        if (!languages.includes(codeOptions.language)) {
            return Promise.reject(new Error('Language not supported!'));
        }
        const id = uuid();
        const codeObject = { ...codeOptions, id };
        logger.info(`Running code with id: ${id}`);

        return new Promise((resolve, reject) => {
            this.jobs.set(id, { resolve, reject });
            this.queue.add(codeObject);
        });
    }

    stop() {
        this.queue.close();
    }
}

export { default as Worker } from './Worker';

export { languages };
