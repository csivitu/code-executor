import Docker from 'dockerode';
import path from 'path';
import logger from './utils/logger';
import { extension } from './utils/findExtension';

export default class Builder {
    private docker: Docker;

    constructor(docker: Docker) {
        this.docker = docker;
    }

    async build(langs?: Array<string>): Promise<void> {
        const supportedLanguages = Object.keys(extension);
        const languages = langs || supportedLanguages;
        languages.forEach(async (lang) => {
            if (supportedLanguages.includes(lang)) {
                logger.log({ level: 'info', message: `building ${lang}` });
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
                    this.docker.modem.followProgress(stream, (err:
                    Error, res:
                    Array<object>) => (err ? reject(err) : resolve(res)));
                });
                logger.log({ level: 'info', message: `built ${lang} successfully` });
            } else {
                logger.log({ level: 'info', message: `${lang} is not supported` });
            }
        });
    }
}
