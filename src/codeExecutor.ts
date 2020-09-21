import Bull from 'bull';
import Docker from 'dockerode';
import Builder from './Builder';
import Worker from './Worker';
import * as dotenv from 'dotenv';

dotenv.config();

const Queue = new Bull('queue');
const docker = new Docker();
const builder = new Builder(docker);
const worker = new Worker();

interface TestCase {
    input: string;
    output: string;
}
interface Code {
    id: string;
    code: string,
    language: string,
    testCases: TestCase[];
}

export default class CodeExecutor {
    private Queue: typeof Queue;

    private builder: typeof builder;

    queue: Code[];

    redis: string;

    noOfWorkers: number;

    constructor(obj: any) {
        this.redis = obj.redis;
        this.noOfWorkers = obj.noOfWorkers;
    }

    async buildContainer(): Promise<void> {
        await this.builder.build('python-runner');
    }

    async add(codeOptions: Code): Promise<void> {
        const data = codeOptions;
        await this.Queue.add(data);
    }

    async start(): Promise<void> {
        await this.Queue.process((job) => {
            worker.work(job.data);
        });
    }
}
