import Docker from 'dockerode';
import path from 'path';
import writeToFile from './utils/writeToFile';
import generateFolder from './utils/generateFolder';
import decodeBase64 from './utils/decodeBase64';

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
        const opts = options || { base64: false, folderPath: process.env.PATH };

        if (opts.base64) {
            decodeBase64(code);
        }

        const Path = await Runner.saveCode(opts.folderPath, code);

        await this.docker.createContainer({
            AttachStdin: false,
            AttachStdout: true,
            Tty: false,
            Cmd: [],
            HostConfig: { Mounts: [{ Source: Path, Target: '/app', Type: 'bind' }] },

        });

        await this.docker.run(tag, [], process.stdout);
    }
}
