import Docker from 'dockerode';
import path from 'path';
import { performance } from 'perf_hooks';
import writeToFile from './utils/writeToFile';
import generateFolder from './utils/generateFolder';
import decodeBase64 from './utils/decodeBase64';
import containerLogs from './utils/containerLogs';
import logger from './utils/logger';
import findExtension from './utils/findExtension';
import { TestCase } from './models/models';

interface RunnerOpts {
    id: string;
    tag: string;
    code: string;
    testCases: TestCase[];
    base64: boolean;
    folderPath: string;
    language: string;
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
        language: string,
    ): Promise<string> {
        const folder = await generateFolder(folderPath);
        const extension = findExtension(language);

        const promisesToKeep = [(base64)
            ? writeToFile(path.join(folder, `code.${extension}`), decodeBase64(code))
            : writeToFile(path.join(folder, `code.${extension}`), code)];
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
            language,
        }: RunnerOpts,
    ): Promise<object> {
        const Path = await Runner.saveCode(folderPath, code, testCases, base64, language);

        const container = await this.docker.createContainer({
            Image: tag,
            Cmd: ['bash', '/start.sh'],
            HostConfig: {
                Mounts: [{
                    Source: Path,
                    Target: '/app',
                    Type: 'bind',
                }],
            },
        });

        const t0 = performance.now();
        await container.start();
        const t1 = performance.now();
        logger.log({ level: 'info', message: `Took ${t1 - t0} seconds` });

        const [outputStream, errorStream] = await containerLogs(container);

        const result = {
            output: outputStream.on('data', (chunk) => {
                logger.log({ level: 'info', message: chunk });
            }),
            error: errorStream.on('data', (chunk) => {
                logger.log({ level: 'error', message: chunk });
            }),
        };

        return result;
    }
}
