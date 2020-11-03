import commander, { Command } from 'commander';
import logger from './utils/logger';
import { WorkerCLIOptions } from './models';
import Worker from './Worker';

class WorkerCLI {
    readonly program: commander.Command;

    readonly args: string[];

    constructor(args: string[]) {
        this.program = new Command();
        this.args = args;
        this.init();
    }

    init(): void {
        this.program
            .command('spawn-worker')
            .alias('sw')
            .description('spawn worker process')
            .action(() => {
                const options = this.parseOptions();
                WorkerCLI.spawnWorker(options);
            });

        this.program
            .option('-r, --redis <redis>', 'URL for the redis instance')
            .option('-q, --queue <queue>', 'name of the redis queue')
            .option('-l, --langs <langs...>', 'list of languages to build');
    }

    parseOptions(): WorkerCLIOptions {
        const opts = this.program.opts();

        const options: WorkerCLIOptions = {
            redis: opts.redis || 'redis://127.0.0.1:6379',
            queue: opts.queue || 'myExecutor',
            langs: opts.langs || [],
        };

        return options;
    }

    static async spawnWorker(options: WorkerCLIOptions): Promise<void> {
        logger.info('Spawning Workers...');

        const worker = new Worker(options.queue, options.redis);
        await worker.build(options.langs.length ? options.langs : undefined);
        worker.start();
    }

    async start(): Promise<void> {
        await this.program.parseAsync(this.args);
    }
}

export default async function cli(args: string[]): Promise<void> {
    const workerCLI = new WorkerCLI(args);
    workerCLI.start();
}
