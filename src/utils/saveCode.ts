import path from 'path';
import writeToFile from './writeToFile';
import generateFolder from './generateFolder';
import findExtension from './findExtension';
import decodeBase64 from './decodeBase64';
import { TestCase } from '../models';

export default async function saveCode(
    folderPath: string,
    code: string,
    testCases: TestCase[],
    base64: boolean,
    language: string,
): Promise<string[]> {
    const folderPromises: Array<Promise<string>> = [];
    testCases.forEach(() => {
        folderPromises.push(generateFolder(folderPath));
    });
    const folders = await Promise.all(folderPromises);
    const extension = findExtension(language);
    const promisesToKeep = [];
    for (let i = 0; i < testCases.length; i += 1) {
        promisesToKeep.push((base64)
            ? writeToFile(path.join(folders[i], `Main.${extension}`), decodeBase64(code))
            : writeToFile(path.join(folders[i], `Main.${extension}`), code));
        const input = (base64)
            ? decodeBase64(testCases[i].input)
            : testCases[i].input;
        promisesToKeep.push(writeToFile(path.join(folders[i], `in${i}.txt`), input));
    }
    await Promise.all(promisesToKeep);
    return folders;
}
