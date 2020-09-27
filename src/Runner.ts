import Docker from 'dockerode';
import path from 'path';
import { performance } from 'perf_hooks';
import del from 'del';
import writeToFile from './utils/writeToFile';
import generateFolder from './utils/generateFolder';
import decodeBase64 from './utils/decodeBase64';
import logger from './utils/logger';
import findExtension from './utils/findExtension';
import {
    TestCase,
    Result,
    Tests,
} from './models/models';
import getOutput from './utils/getOutput';

interface RunnerOpts {
    id: string;
    tag: string;
    code: string;
    testCases: TestCase[];
    base64: boolean;
    folderPath: string;
    language: string;
    timeout: number;
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
    ): Promise < string > {
        const folder = await generateFolder(folderPath);
        const extension = findExtension(language);
        const promisesToKeep = [(base64)
            ? writeToFile(path.join(folder, `code.${extension}`), decodeBase64(code))
            : writeToFile(path.join(folder, `code.${extension}`), code),
        ];
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

    async run({
        id,
        tag,
        code,
        testCases,
        base64,
        folderPath,
        language,
        timeout,
    }: RunnerOpts): Promise < Result > {
        const Path = await Runner.saveCode(folderPath, code, testCases, base64, language);
        const container = await this.docker.createContainer({
            Image: tag,
            Cmd: ['bash', '/start.sh', `${testCases.length}`, `${timeout}`],
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
        await container.wait();
        const t1 = performance.now();
        logger.log({
            level: 'info',
            message: `Process ${id} completed in ${t1 / 1000 - t0 / 1000} seconds`,
        });
        container.remove();
        const [output, runTime, error, exitCodes] = await getOutput(Path, testCases.length);
        del(Path, {
            force: true,
        });
        const tests: Tests[] = [];
        for (let i = 0; i < testCases.length; i += 1) {
            const expectedOutput = testCases[i].output;
            const obtainedOutput = output[i].toString();
            const time = runTime[i].toString().split('\n');
            const exitCode = parseInt(exitCodes[i].toString(), 10);
            let remarks;
            if (exitCode === 124) {
                remarks = 'Time limit exceeded';
            } else if (exitCode === 0) {
                remarks = expectedOutput === obtainedOutput ? 'Pass' : 'Fail';
            } else {
                remarks = 'Error';
            }
            tests.push({
                input: testCases[i].input,
                expectedOutput,
                obtainedOutput,
                remarks,
                exitCode,
                error: error[i].toString(),
                runTime: (parseInt(time[1], 10) - parseInt(time[0], 10)) / 1000000000,
            });
        }
        const result = {
            id,
            tests,
        };
        return result;
    }
}
