import Docker from 'dockerode';
import Bull from 'bull';
import Runner from './Runner';
import Builder from './Builder';

import { Code } from './models';

export default class Worker {
    private redis: string;

    private name: string;

    private runner: Runner;

    private docker: Docker;

    private builder: Builder;

    constructor(name: string, redis: string) {
        this.redis = redis;
        this.name = name;
        this.docker = new Docker();
        this.runner = new Runner(this.docker);
        this.builder = new Builder(this.docker);
    }

    private queue = (() => new Bull(this.name, this.redis))();

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
