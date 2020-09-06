import Docker from 'dockerode';

export default class Runner {
    private docker: Docker;

    readonly tag: string;

    constructor(docker: Docker) {
        this.docker = docker;
    }

    async runner(tag: string): Promise<void> {
        await this.docker.run(tag, ['python', '-c', 'uname -a'], process.stdout);
    }
}
