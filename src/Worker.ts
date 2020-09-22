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
        let CodeOptions = codeOptions;
        CodeOptions = {
            id: '1', language: 'python', code: 'print(`hello`)', testCases: [{ input: '', output: 'hello' }],
        };
        const array = [];
        for (let i = 0; i < CodeOptions.testCases.length; i += 1) {
            array.push(this.runner.run({ tag: 'python-runner', code: 'print("hello")', testCases: [{ input: '5', output: '0 1 1 2 3' }] }));
        }
        const array2 = await Promise.all(array);
    }
}
