import Docker from 'dockerode';
import path from 'path';
import * as fs from 'fs';
import logger from './utils/logger';

export default class Builder {
    private docker: Docker;

    constructor(docker: Docker) {
        this.docker = docker;
    }

    async build(): Promise<void> {
        const languages = fs.readdirSync(path.join(__dirname, 'langs'));
        languages.forEach(async (lang) => {
            const stream: NodeJS.ReadableStream = await this.docker.buildImage({
                context: path.join(__dirname, 'langs', lang),
                src: ['Dockerfile', 'start.sh'],
            }, {
                t: `${lang.toLowerCase()}-runner`,
            });

            stream.on('data', (chunk) => {
                logger.log({ level: 'info', message: chunk });
            });
            await new Promise((resolve, reject) => {
                this.docker.modem.followProgress(stream, (err: Error, res: Array<object>) => err ? reject(err) : resolve(res));
            });
        });
    }
}
