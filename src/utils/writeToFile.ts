import fs from 'fs';

export default async function writeToFile(path: string, data: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}
