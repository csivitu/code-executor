import { Worker, languages } from '../src/CodeExecutor';
import logger from '../src/utils/logger';

/**
  * name, redis, options
  *
  * Options:
  *
  * folderPath ( path to mount, default /tmp/code-exec ),
  * memory (in MB, default 0, ie no limit),
  * CPUs (no. of CPUs, default 0.5),
*/
const worker = new Worker('myExecutor', 'redis://127.0.0.1:6379');

async function main() {
    logger.info(languages);

    /* array of languages is optional argument */
    await worker.build(['Python', 'Bash']);

    worker.start();

    worker.pause();

    worker.resume();

    // worker.stop();
}

main();
