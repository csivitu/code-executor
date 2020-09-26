import Docker from 'dockerode';
import path from 'path';
import { performance } from 'perf_hooks';
import del from 'del';
import writeToFile from './utils/writeToFile';
import generateFolder from './utils/generateFolder';
import decodeBase64 from './utils/decodeBase64';
import logger from './utils/logger';
import findExtension from './utils/findExtension';
import { TestCase, Result, Tests } from './models/models';
import containerLogs from './utils/containerLogs';
import getOutput from './utils/getOutput';

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
            id,
            tag,
            code,
            testCases,
            base64,
            folderPath,
            language,
        }: RunnerOpts,
    ): Promise<Result> {
        const Path = await Runner.saveCode(folderPath, code, testCases, base64, language);

        const container = await this.docker.createContainer({
            Image: tag,
            Cmd: ['bash', '/start.sh', `${testCases.length}`],
            HostConfig: {
                Mounts: [{
                    Source: Path,
                    Target: '/app',
                    Type: 'bind',
                }],
            },
        });

        await container.start();
        const t0 = performance.now();
        const status = await container.wait();
        const t1 = performance.now();

        logger.log({ level: 'info', message: `Process ${id} took ${t1 - t0} milli seconds` });

        const [outputStream, errorStream] = await containerLogs(container);

        outputStream.on('data', (chunk) => {
            logger.log({ level: 'debug', message: chunk });
        });

        errorStream.on('data', (chunk) => {
            logger.log({ level: 'error', message: chunk });
        });

        container.remove();

        const output = await getOutput(Path, testCases.length);

        del(Path, { force: true });

        const tests: Tests[] = [];

        for (let i = 0; i < testCases.length; i += 1) {
            const expectedOutput = testCases[i].output;
            const obtainedOutput = output[i].toString();
            tests.push({
                input: testCases[i].input,
                expectedOutput,
                obtainedOutput,
                remarks: expectedOutput === obtainedOutput ? 'pass' : 'fail',
                status: status.StatusCode,
            });
        }

        const result = {
            id,
            tests,
        };

        return result;
    }
}
