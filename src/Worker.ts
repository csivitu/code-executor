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

    private folderPath?: string;

    private base64?: boolean;

    constructor(name: string, redis: string, folderPath?: string, base64?: boolean) {
        this.docker = new Docker();
        this.runner = new Runner(this.docker);
        this.builder = new Builder(this.docker);
        this.queue = new Bull(name, redis);
        this.folderPath = folderPath || '/tmp';
        this.base64 = base64 || false;
    }

    private async work(codeOptions: Code): Promise<void> {
        const tag = `${codeOptions.language.toLowerCase()}-runner`;
        const { code } = codeOptions;
        await this.runner.run({
            tag,
            code,
            testCases: codeOptions.testCases,
            folderPath: this.folderPath,
            base64: this.base64,
        });
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
