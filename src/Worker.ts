import Docker from 'dockerode';
import Bull from 'bull';

import Runner from './Runner';
import Builder from './Builder';

import { Code, Result } from './models/models';
import logger from './utils/logger';

export default class Worker {
    private runner: Runner;

    private docker: Docker;

    private builder: Builder;

    private queue: Bull.Queue;

    private folderPath?: string;

    constructor(name: string, redis: string, folderPath?: string) {
        this.docker = new Docker();
        this.runner = new Runner(this.docker);
        this.builder = new Builder(this.docker);
        this.queue = new Bull(name, redis);
        this.folderPath = folderPath || '/tmp/code-exec';
    }

    private async work(codeOptions: Code): Promise<Result> {
        const tag = `${codeOptions.language.toLowerCase()}-runner`;

        const result = await this.runner.run({
            tag,
            id: codeOptions.id,
            code: codeOptions.code,
            testCases: codeOptions.testCases,
            folderPath: this.folderPath,
            base64: codeOptions.base64 || false,
            language: codeOptions.language,
            timeout: codeOptions.timeout,
        });

        return result;
    }

    async build(langs?: Array<string>) {
        await this.builder.build(langs);
    }

    start() {
        this.queue.process(async (job, done) => {
            logger.info(`Received: ${job.data.id}`);
            const result = await this.work(job.data);

            logger.debug(JSON.stringify(result));
            done(null, result);
        });
    }

    pause() {
        this.queue.pause();
    }

    resume() {
        this.queue.resume();
    }

    stop() {
        this.queue.close();
    }
}
