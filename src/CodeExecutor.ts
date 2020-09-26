import Bull from 'bull';

import { Code } from './models/models';

export default class CodeExecutor {
    private sendQueue: Bull.Queue;

    private recieveQueue: Bull.Queue;

    constructor(name: string, redis: string) {
        this.sendQueue = new Bull(`${name}Send`, redis);
        this.recieveQueue = new Bull(`${name}Recieve`, redis);
    }

    async add(codeOptions: Code): Promise<void> {
        await this.sendQueue.add(codeOptions);
    }

    onComplete(cb: (outcome: object) => void) {
        this.recieveQueue.process((job, done) => {
            cb(job.data);
            done();
        });
    }
}

export { default as Worker } from './Worker';
