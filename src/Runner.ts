import Docker from 'dockerode';
import path from 'path';
import writeToFile from './utils/writeToFile';
import generateFolder from './utils/generateFolder';
import decodeBase64 from './utils/decodeBase64';
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

    async run(tag: string, code: string, options?: RunnerOptions): Promise<void> {
        const opts = options || { base64: false, folderPath: process.env.FOLDERPATH };

        if (opts.base64) {
            decodeBase64(code);
        }

        const Path = await Runner.saveCode(opts.folderPath, code);

        const [status, container] = await this.docker.run(tag, ['python3', '/app/code.py'], process.stdout, { HostConfig: { Mounts: [{ Source: Path, Target: '/app', Type: 'bind' }] } });

        logger.log(status.StatusCode);
        logger.log(container.id);
    }
}
