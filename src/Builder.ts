import Docker from 'dockerode';
import path from 'path';

export default class Builder {
    private docker: Docker;

    readonly tag: string;

    constructor(docker: Docker) {
        this.docker = docker;
    }

    async build(img: string): Promise<void> {
        const stream: NodeJS.ReadableStream = await this.docker.buildImage({
            context: path.join(__dirname, 'langs', 'Python'),
            src: ['Dockerfile', 'hello.py'],
        }, {
            t: img,
        });

        stream.pipe(process.stdout, {
            end: true,
        });

        await this.docker.createContainer({
            Image: img,
            AttachStdin: false,
            AttachStdout: true,
            Tty: false,
            Cmd: [],
            Volumes: {
                '/app': {},
            },
            Binds: ['']
        });
    }
}
