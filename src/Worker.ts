import Docker from 'dockerode';
import Bull, { Job } from 'bull';
import Runner from './Runner';
import Builder from './Builder';

import { Code } from './models';

export default class Worker {
    private runner: Runner;

    private docker: Docker;

    private builder: Builder;

    private queue: Bull.Queue;

    private job: Bull.Job;

    private folderPath?: string;

    constructor(name: string, redis: string, folderPath?: string) {
        this.docker = new Docker();
        this.runner = new Runner(this.docker);
        this.builder = new Builder(this.docker);
        this.queue = new Bull(name, redis);
        this.folderPath = folderPath || '/tmp';
    }

    private async work(codeOptions: Code): Promise<void> {
        const tag = `${codeOptions.language.toLowerCase()}-runner`;
        await this.runner.run({
            tag,
            id: codeOptions.id,
            code: codeOptions.code,
            testCases: codeOptions.testCases,
            folderPath: this.folderPath,
            base64: codeOptions.base64 || false,
            language: codeOptions.language,
        });
    }

    async build() {
        await this.builder.build();
    }

    start() {
        this.queue.process(async (job, done) => {
            await this.work(job.data);
            this.progress(job);
            done();
        });
    }

    progress(job: Job) {
        let progress = 0;
        for (let i = 0; i < 100; i += 1) {
            this.work(job.data);
            progress += 10;
            job.progress(progress);
        }
    }
}
