import Docker from 'dockerode';
import { performance } from 'perf_hooks';
import del from 'del';
import decodeBase64 from './utils/decodeBase64';
import logger from './utils/logger';
import {
    TestCase,
    Result,
    Tests,
} from './models/models';
import getOutput from './utils/getOutput';
import saveCode from './utils/saveCode';

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
        const Path = await saveCode(folderPath, code, testCases, base64, language);

        logger.info(`Starting process ${id}`);

        const t0 = performance.now();
        await this.docker.run(tag, ['bash', '/start.sh', `${testCases.length}`, `${timeout}`], null, {
            HostConfig: {
                AutoRemove: true,
                Mounts: [{
                    Source: Path,
                    Target: '/app',
                    Type: 'bind',
                }],
            },
        });
        const t1 = performance.now();

        logger.info(`Process ${id} completed in ${(t1 - t0) / 1000} seconds`);

        const [output, runTime, error, exitCodes] = await getOutput(Path, testCases.length);
        del(Path, {
            force: true,
        });

        const tests: Tests[] = [];
        for (let i = 0; i < testCases.length; i += 1) {
            const expectedOutput = (base64)
                ? decodeBase64(testCases[i].output)
                : testCases[i].output;
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
