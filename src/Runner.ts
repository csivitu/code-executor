import Docker from 'dockerode';
import path from 'path';
import randomstring from 'randomstring';
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
        await generateFolder(folderPath);
        await writeToFile(path.join(folderPath, randomstring.generate(10)), code);
    }

    async run(tag: string, code: string, options?: RunnerOptions): Promise<void> {
        const opts = options || { base64: false, folderPath: '/tmp' };

        if (opts.base64) {
            decodeBase64(code);
        }

        await Runner.saveCode(opts.folderPath, code);

        await this.docker.run(tag, [], process.stdout);
    }
}
