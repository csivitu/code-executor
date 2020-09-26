import Docker from 'dockerode';
import Bull from 'bull';
import Runner from './Runner';
import Builder from './Builder';

import { Code } from './models/models';

export default class Worker {
    private runner: Runner;

    private docker: Docker;

    private builder: Builder;

    private sendQueue: Bull.Queue;

    private recieveQueue: Bull.Queue;

    private folderPath?: string;

    constructor(name: string, redis: string, folderPath?: string) {
        this.docker = new Docker();
        this.runner = new Runner(this.docker);
        this.builder = new Builder(this.docker);
        this.sendQueue = new Bull(`${name}Send`, redis);
        this.recieveQueue = new Bull(`${name}Recieve`, redis);
        this.folderPath = folderPath || '/tmp/code-exec';
    }

    private async work(codeOptions: Code): Promise<object> {
        const tag = `${codeOptions.language.toLowerCase()}-runner`;
        const result = await this.runner.run({
            tag,
            id: codeOptions.id,
            code: codeOptions.code,
            testCases: codeOptions.testCases,
            folderPath: this.folderPath,
            base64: codeOptions.base64 || false,
            language: codeOptions.language,
        });
        return result;
    }

    async build(langs?: Array<string>) {
        await this.builder.build(langs);
    }

    start() {
        this.sendQueue.process(async (job, done) => {
            const result = await this.work(job.data);
            await this.recieveQueue.add({ input: job.data, result });
            done();
        });
    }
}
