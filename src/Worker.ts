import Docker from 'dockerode';
import Runner from './Runner';

const docker = new Docker();
const runner = new Runner(docker);

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

export default class Worker {
    private runner: typeof runner;

    async work(codeOptions: Code): Promise<void> {
        await this.runner.run('python-runner', 'print("hello")');
    }
}
