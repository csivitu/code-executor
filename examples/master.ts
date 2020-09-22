import CodeExecutor from '../src/codeExecutor';

const codeExecutor = new CodeExecutor('myexecutor', 'redis://127.0.0.1:6379');

const inputs = [{
    id: '1', language: 'python', code: 'print("hello")', testCases: [{ input: '', output: 'hello' }],
}];

function main() {
    inputs.forEach(async (input) => {
        await codeExecutor.add(input);
    });
}

main();
