import CodeExecutor from '../src/codeExecutor';

const codeExecutor = new CodeExecutor({ redis: 'redis://127.0.0.1:6379', noOfWorkers: 5 });

const inputs = [{
    id: '1', language: 'python', code: 'print(`hello`)', testCases: [{ input: '', output: 'hello' }],
}];

async function main(): Promise<void> {
    inputs.forEach((input) => {
        codeExecutor.buildContainer(input.language);
        codeExecutor.add(input);
    });
    codeExecutor.start();
}

main();
