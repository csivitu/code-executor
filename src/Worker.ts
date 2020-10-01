import Docker from 'dockerode';
import Bull from 'bull';

import Runner from './Runner';
import Builder from './Builder';

import { Code, Result, WorkerOptions } from './models/models';
import logger from './utils/logger';

export default class Worker {
    private runner: Runner;

    private docker: Docker;

    private builder: Builder;

    private queue: Bull.Queue;

    private folderPath?: string;

    private memory?: number;

    private CPUs?: number;

    constructor(name: string, redis: string, options?: WorkerOptions) {
        this.docker = new Docker();
        this.runner = new Runner(this.docker);
        this.builder = new Builder(this.docker);
        this.queue = new Bull(name, redis);

        const opts = options || {};
        const { folderPath, memory, CPUs } = opts;

        this.folderPath = folderPath || '/tmp/code-exec';
        this.memory = memory || 0;
        this.CPUs = CPUs || 0.5;
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
            memory: this.memory,
            CPUs: this.CPUs,
        });

        return result;
    }

    async build(langs?: Array<string>): Promise<void> {
        try {
            await this.builder.build(langs);
            return null;
        } catch (e) {
            return Promise.reject(e);
        }
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
