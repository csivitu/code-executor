import Docker from 'dockerode';
import Bull from 'bull';
import Runner from './Runner';
import Builder from './Builder';

import { Code } from './models';

export default class Worker {
    private runner: Runner;

    private docker: Docker;

    private builder: Builder;

    private queue: Bull.Queue;

    constructor(name: string, redis: string) {
        this.docker = new Docker();
        this.runner = new Runner(this.docker);
        this.builder = new Builder(this.docker);
        this.queue = new Bull(name, redis);
    }

    private async work(codeOptions: Code): Promise<void> {
        const tag = `${codeOptions.language.toLowerCase()}-runner`;
        const { code } = codeOptions;
        await this.runner.run({ tag, code, testCases: codeOptions.testCases });
    }

    async build() {
        await this.builder.build();
    }

    start() {
        this.queue.process(async (job, done) => {
            await this.work(job.data);
            done();
        });
    }
}
