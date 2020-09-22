import Docker from 'dockerode';
import path from 'path';
import * as fs from 'fs';

export default class Builder {
    private docker: Docker;

    constructor(docker: Docker) {
        this.docker = docker;
    }

    async build(): Promise<void> {
        const dir = path.join(__dirname, 'langs');
        fs.readdir(dir, (err, langs) => {
            if (err) throw err;
            langs.forEach(async (lang) => {
                const stream: NodeJS.ReadableStream = await this.docker.buildImage({
                    context: path.join(__dirname, 'langs', lang),
                    src: ['Dockerfile'],
                }, {
                    t: `${lang.toLowerCase()}-runner`,
                });

                stream.pipe(process.stdout);
            });
        });
    }
}
