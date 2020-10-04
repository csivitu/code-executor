import fs from 'fs';
import path from 'path';
import randomstring from 'randomstring';

export default async function generateFolder(folderPath: string): Promise<string> {
    const ultimatePath = path.join(folderPath, randomstring.generate(10));
    return new Promise((resolve, reject) => {
        fs.mkdir(ultimatePath, { recursive: true }, (err) => {
            fs.chmod(folderPath, '0777', () => {
                fs.chmod(ultimatePath, '0777', () => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(ultimatePath);
                    }
                });
            });
        });
    });
}
