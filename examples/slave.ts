import { Worker } from '../src/CodeExecutor';

/* name, redis, folderPath, default folderPath is /tmp
( folderPath will be mounted in container,
    the code and testcases will be saved here ) */
const worker = new Worker('myexecutor', 'redis://127.0.0.1:6379');

async function main() {
    await worker.build();
    worker.start();
}

main();
