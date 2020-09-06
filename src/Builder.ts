import Docker from 'dockerode';
import path from 'path';

export default class Builder {
    private docker: Docker;

    constructor(docker: Docker) {
        this.docker = docker;
    }

    async build(): Promise<void> {
        const stream: NodeJS.ReadableStream = await this.docker.buildImage({
            context: path.join(__dirname, 'langs', 'python'),
            src: ['Dockerfile', 'hello.py'],
        }, {
            t: 'python',
        });

        stream.pipe(process.stdout, {
            end: true,
        });
    }
}
