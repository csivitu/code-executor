import CodeExecutor from '../src/codeExecutor';

const codeExecutor = new CodeExecutor({ redis: 'redis://127.0.0.1:6379', noOfWorkers: 5 });

async function main(): Promise<void> {
    codeExecutor.buildContainer();
    codeExecutor.add({
        id: '1', language: 'python', code: 'print(`hello`)', testCases: [{ input: '', output: 'hello' }],
    });
    codeExecutor.start();
}

main();
