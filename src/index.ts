import Docker from 'dockerode';

import Builder from './Builder';

const docker = new Docker();
const builder = new Builder(docker);
builder.build();
