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
        const streams: Promise<NodeJS.ReadableStream>[] = [];

        languages.forEach((lang) => {
            if (supportedLanguages.includes(lang)) {
                logger.info(`Building ${lang}...`);

                streams.push(this.docker.buildImage({
                    context: path.join(__dirname, 'langs', lang),
                    src: ['Dockerfile', 'start.sh'],
                }, {
                    t: `${lang.toLowerCase()}-runner`,
                }));
            } else {
                streams.push(Promise.reject(new Error(`${lang} is not supported`)));
            }
        });

        let resolvedStreams;
        try {
            resolvedStreams = await Promise.all(streams);
        } catch (e) {
            logger.error(e);
            return Promise.reject(e);
        }

        const progress: Promise<object>[] = [];
        (resolvedStreams).forEach((stream) => {
            stream.on('data', (chunk) => {
                logger.debug(chunk);
            });

            progress.push(new Promise((resolve, reject) => {
                this.docker.modem.followProgress(stream, (
                    err: Error,
                    res: Array<object>,
                ) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            }));
        });
        try {
            await Promise.all(progress);
        } catch (e) {
            logger.error(e);
            return Promise.reject(e);
        }
        logger.info('Built containers successfully');
        return null;
    }
}
