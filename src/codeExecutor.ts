import * as dotenv from 'dotenv';
import Bull from 'bull';
import Worker from './Worker';

dotenv.config();

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
    private redis: string;

    private name: string;

    constructor(name: string, redis: string) {
        this.redis = redis;
        this.name = name;
    }

    private queue = (() => new Bull(this.name, this.redis))();

    async add(codeOptions: Code): Promise<void> {
        await this.queue.add(codeOptions);
    }
}

export { Worker };
