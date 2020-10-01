import { Worker } from '../src/CodeExecutor';

const worker = new Worker('myExecutor', 'redis://127.0.0.1:6379');

async function main() {
    await worker.build();

    worker.start();
}

main();
