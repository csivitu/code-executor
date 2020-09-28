/* eslint-disable no-console */
import CodeExecutor from '../src/CodeExecutor';
import logger from '../src/utils/logger';

const codeExecutor = new CodeExecutor('myExecutor', 'redis://127.0.0.1:6379');

/**
  * base64: true is also an option if input,
  * output and code are encoded in base64,
  * default is false
* */

const pythonCode = `
import time
time.sleep(1)
print('hello')
`;

const inputs = [{
    language: 'Python',
    code: pythonCode,
    testCases: [
        {
            input: '',
            output: 'hello\n',
        },
    ],
    timeout: 2,
},
{
    language: 'Bash',
    code: 'echo hello',
    testCases: [
        {
            input: '',
            output: 'hello\n',
        },
    ],
    timeout: 2,
}];

async function main() {
    const results = await Promise.all(
        inputs.map((input) => codeExecutor.runCode(input)),
    );
    logger.info(results);
    codeExecutor.stop();
}

main();
