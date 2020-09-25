import CodeExecutor from '../src/CodeExecutor';

const codeExecutor = new CodeExecutor('myexecutor', 'redis://127.0.0.1:6379');

/**
 * base64: true is also an option if input,
 * output and code are encoded in base64,
 * default is false
 */
const inputs = [{
    id: '1',
    language: 'python',
    code: 'print("hello")',
    testCases: [
        {
            input: '',
            output: 'hello',
        },
    ],
}];

function main() {
    inputs.forEach(async (input) => {
        await codeExecutor.add(input);
    });
}

main();

codeExecutor.on('completed', (job, result) => {
    console.log(job);
    console.log(result);
    console.log("hello");
});
