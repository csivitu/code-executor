import Docker from 'dockerode';
import path from 'path';

export default class Builder {
    private docker: Docker;

    readonly tag: string;

    constructor(docker: Docker) {
        this.docker = docker;
    }

    async build(tag: string): Promise<void> {
        const stream: NodeJS.ReadableStream = await this.docker.buildImage({
            context: path.join(__dirname, 'langs', 'Python'),
            src: ['Dockerfile', 'hello.py'],
        }, {
            t: tag,
        });

        stream.pipe(process.stdout, {
            end: true,
        });
    }
}
