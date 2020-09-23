import Docker from 'dockerode';
import path from 'path';
import writeToFile from './utils/writeToFile';
import generateFolder from './utils/generateFolder';
import decodeBase64 from './utils/decodeBase64';
import containerLogs from './utils/containerLogs';
import logger from './utils/logger';
import { TestCase } from './models';

interface RunnerOpts {
    tag: string;
    code: string;
    testCases: TestCase[];
    base64: boolean;
    folderPath: string;
}

export default class Runner {
    private docker: Docker;

    constructor(docker: Docker) {
        this.docker = docker;
    }

    private static async saveCode(
        folderPath: string,
        code: string,
        testCases: TestCase[],
        base64: boolean,
    ): Promise<string> {
        const folder = await generateFolder(folderPath);
        const promisesToKeep = [(base64)
            ? writeToFile(path.join(folder, 'code.py'), decodeBase64(code))
            : writeToFile(path.join(folder, 'code.py'), code)];
        for (let i = 0; i < testCases.length; i += 1) {
            const [input, output] = (base64)
                ? [decodeBase64(testCases[i].input), decodeBase64(testCases[i].output)]
                : [testCases[i].input, testCases[i].output];
            promisesToKeep.push(writeToFile(path.join(folder, `in${i}.txt`), input));
            promisesToKeep.push(writeToFile(path.join(folder, `out${i}.txt`), output));
        }
        await Promise.all(promisesToKeep);
        return folder;
    }

    async run(
        {
            tag,
            code,
            testCases,
            base64,
            folderPath,
        }: RunnerOpts,
    ): Promise<void> {
        const Path = await Runner.saveCode(folderPath, code, testCases, base64);

        const container = await this.docker.createContainer({
            Image: tag,
            Cmd: ['python3', '/app/code.py'],
            HostConfig: {
                Mounts: [{
                    Source: Path,
                    Target: '/app',
                    Type: 'bind',
                }],
            },
        });

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
