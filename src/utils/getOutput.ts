import util from 'util';
import fs from 'fs';
import path from 'path';

const readFileAsync = util.promisify(fs.readFile);

export default async function getOutput(Path: string, len: number) {
    const output = [];
    for (let i = 0; i < len; i += 1) {
        output.push(readFileAsync(path.join(Path, `output${i}.txt`)));
    }
    return Promise.all(output);
}
