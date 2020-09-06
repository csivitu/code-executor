import Docker from 'dockerode';

export default class Runner {
    private docker: Docker;

    constructor(docker: Docker) {
        this.docker = docker;
    }
}
