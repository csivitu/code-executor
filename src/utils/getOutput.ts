import util from 'util';
import fs from 'fs';
import path from 'path';

const readFileAsync = util.promisify(fs.readFile);

export default async function getOutput(Paths: string[], len: number) {
    const output = [];
    const runTime = [];
    const error = [];
    const exitCodes = [];
    for (let i = 0; i < len; i += 1) {
        output.push(readFileAsync(path.join(Paths[i], `output${i}.txt`)));
        runTime.push(readFileAsync(path.join(Paths[i], `time${i}.txt`)));
        error.push(readFileAsync(path.join(Paths[i], `error${i}.txt`)));
        exitCodes.push(readFileAsync(path.join(Paths[i], `exitCode${i}.txt`)));
    }
    return Promise.all([Promise.all(output),
        Promise.all(runTime),
        Promise.all(error),
        Promise.all(exitCodes)]);
}
