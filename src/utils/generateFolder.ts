import fs from 'fs';
import path from 'path';
import randomstring from 'randomstring';

export default async function generateFolder(folderPath: string): Promise<string> {
    const ultimatePath = path.join(folderPath, randomstring.generate(10));
    return new Promise((resolve, reject) => {
        fs.mkdir(ultimatePath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(ultimatePath);
            }
        });
    });
}
