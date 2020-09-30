import path from 'path';
import writeToFile from './writeToFile';
import generateFolder from './generateFolder';
import findExtension from './findExtension';
import decodeBase64 from './decodeBase64';
import { TestCase } from '../models/models';

export default async function saveCode(
    folderPath: string,
    code: string,
    testCases: TestCase[],
    base64: boolean,
    language: string,
): Promise < string > {
    const folder = await generateFolder(folderPath);
    const extension = findExtension(language);
    const promisesToKeep = [(base64)
        ? writeToFile(path.join(folder, `Main.${extension}`), decodeBase64(code))
        : writeToFile(path.join(folder, `Main.${extension}`), code),
    ];
    for (let i = 0; i < testCases.length; i += 1) {
        const input = (base64)
            ? decodeBase64(testCases[i].input)
            : testCases[i].input;
        promisesToKeep.push(writeToFile(path.join(folder, `in${i}.txt`), input));
    }
    await Promise.all(promisesToKeep);
    return folder;
}
