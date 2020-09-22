import Docker from 'dockerode';
import path from 'path';
import writeToFile from './utils/writeToFile';
import generateFolder from './utils/generateFolder';
import decodeBase64 from './utils/decodeBase64';
import containerLogs from './utils/containerLogs';
import logger from './utils/logger';

interface RunnerOptions {
    base64: boolean;
    folderPath: string;
}

export default class Runner {
    private docker: Docker;

    constructor(docker: Docker) {
        this.docker = docker;
    }

    static async saveCode(folderPath: string, code: string) {
        const folder = await generateFolder(folderPath);
        await writeToFile(path.join(folder, 'code.py'), code);
        return folder;
    }

    async run({ tag, code, testCases, options }: { tag: string; code: string; testCases: Array<object>; options?: RunnerOptions; }): Promise<void> {
        const opts = options || { base64: false, folderPath: process.env.FOLDERPATH };

        if (opts.base64) {
            decodeBase64(code);
        }

        const Path = await Runner.saveCode(opts.folderPath, code);
        const container = await this.docker.createContainer({ Image: tag, Cmd: ['python3', '/app/code.py'], HostConfig: { Mounts: [{ Source: Path, Target: '/app', Type: 'bind' }] } });

        await container.start();

        const [outputStream, errorStream] = await containerLogs(container);

        outputStream.on('data', (chunk) => {
            logger.log({ level: 'info', message: chunk });
        });

        errorStream.on('data', (chunk) => {
            logger.log({ level: 'error', message: chunk });
        });
    }
}
