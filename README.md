[![csivit][csivitu-shield]][csivitu-url]
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
[![Issues][issues-shield]][issues-url]

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/csivitu/code-executor">
    <img src="https://raw.githubusercontent.com/csivitu/CSIWebsite2.0/master/Website/images/favicon.png" alt="Logo" width="80">
  </a>

  <h3 align="center">code-executor</h3>

  <p align="center">
    A library to execute code against test cases in various languages and obtain relevant results.
    <br />
    <a href="https://github.com/csivitu/code-executor"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/csivitu/code-executor">View Demo</a>
    ·
    <a href="https://github.com/csivitu/code-executor/issues">Report Bug</a>
    ·
    <a href="https://github.com/csivitu/code-executor/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
  * [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)
* [Contributors](#contributors-)



<!-- ABOUT THE PROJECT -->
## About The Project

<!-- [![Product Name Screen Shot][product-screenshot]](https://example.com) -->

**code-executor** is a Node.js library built for the purpose of executing code in an isolated container against user defined test cases.
<br />

**code-executor** allows you to run arbitrary code in scalable, secure containers and returns metrics for each test case, such as the time taken, errors occured (if any), and the status (pass/fail).
<br />

This library uses a master-slave structure to run programs, which makes it scalable across servers as long as they use the same `Redis` instance. Visit the [usage](#usage) section to learn more.


### Built With

* [Typescript](https://www.typescriptlang.org/)
* [Node](https://nodejs.org/en/)
* [Bull](https://optimalbits.github.io/bull/)
* [Redis](https://redis.io/)



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

- [npm](https://www.npmjs.com/)
- [redis](https://redis.io/)
- [docker](https://www.docker.com/)

### Installation
 
You can install **code-executor** using `npm`.

```sh
npm install code-executor --save
```


<!-- USAGE EXAMPLES -->
## Usage

`code-executor` exports a default `CodeExecutor` class and a `Worker` class. The following documentation describes these classes in brief along with examples of how to use them in your project. For the purpose of documentation, we consider a simple Competitive Coding website backend which uses `code-executor` to run programs submitted by the users.


### TL;DR

- In your backend, you can create a `CodeExecutor` object, which has a `runCode` method. This returns a promise which resolves when the program passed to it has finished executing. You can check out [this example](https://github.com/csivitu/code-executor/blob/master/examples/master.ts) to find out how to use a `CodeExecutor` object.

- Now, you can create any number of workers by running the following script (a CLI is coming soon!):

```js
import { Worker } from 'code-executor';

const worker = new Worker('myExecutor', 'redis://127.0.0.1:6379');

async function main() {
    /* array of languages is optional argument */
    await worker.build(['Python', 'Bash']);

    worker.start();
}

main();
```

- Make sure that the `name` and the `redis` parameters passed to both the objects (of `CodeExecutor` and `Worker`) are exactly the same for `code-executor` to function properly. That's all!


### Brief Description

- As mentioned before, `code-executor` is built using the master-slave strategy. Therefore, there is a `master` which is responsible for assigning work to a set of `workers`. These workers respond to the master on completing their tasks. In the case of the Competitive Coding website, the backend of the website is the `master`, whereas you can run separate `Node.js` scripts for spawning workers (a CLI is coming soon!).

- The backend assigns jobs to the workers through a `queue`, which is stored in the `Redis` instance and managed by the `bull` library. This abstracts process synchronization and ensures that no two workers are working on the same job. Once the workers finish executing the code, they respond to the master, and the backend can respond with success or failure, and other details returned by the worker.

- `code-executor` is built in a way that it allows multiple masters and workers to run parallely while internally handling synchronization. This allows you to have `worker`s on different instances of a cluster as long as they use the same `Redis` instance. You can also scale your backend to have multiple `master`s.


### CodeExecutor

The default export from the `code-executor` library is the `CodeExecutor` class. This is the `master` class, which can be run on the backend of your website. The purpose of this class is to assign jobs to the workers (through a `queue` as mentioned before, though this is abstracted so you need not worry about it). You can create an object of `CodeExecutor` and keep adding jobs to it as you keep getting submissions on your website. 
<br />

You can create a `CodeExecutor` object in the following manner. You must pass the name of your queue and the redis instance you want the queue to be placed on. These details will later be used by the `worker` to identify jobs and run them.

> Note: `job` refers to the task of execution of a single program which is passed using a queue to the workers.


```js
import CodeExecutor from 'code-executor';
const codeExecutor = new CodeExecutor('myExecutor', 'redis://127.0.0.1:6379');
```

Now, say you received an a submission from a user, and you want to run their code against a set of test cases. You can use the following code inside your route handler.

```js
async function routeHandler(code, language) {
  const input = {
    language: language,
    code: code,
    testCases: [
      {
        input: '',
        output: 'hello\n',
      },
    ],
    timeout: 2,
  };

  // We re-use the codeExecutor object that was created before.
  const results = await codeExecutor.runCode(input);

  console.log(results);
  return results;
}
```

That is all! `codeExecutor.runCode()` returns a promise which resolves when your code has been executed successfully by any of the `worker`s. You can also stop a `master` from interacting with a queue using `codeExecutor.stop()`.

```js
codeExecutor.stop();
```


### Worker

By now, we know how to use the `CodeExecutor` class to assign jobs to workers. Now, we will learn how to use the `Worker` class to create workers that will run your code.

```js
import { Worker } from 'code-executor';
const worker = new Worker('myExecutor', 'redis://127.0.0.1:6379');
```

You can create a new `Worker` object and listen with the same `name` and `redis` string you passed to the master class. There is another optional parameter called `folderPath`, which we will discuss later.
<br />

An object of the `Worker` class has the following important functions:

- `build(langs)`
- `start()`
- `pause()`
- `resume()`


### worker.build(langs)

`worker.build()` is responsible for building docker images on the system. You can pass a list of languages to the function so that it builds images for just the specified languages.

```js
async function build() {
  await worker.build(['Python', 'Bash']);
  console.log('Python and Bash containers built successfully!');
}
```

### worker.start()

On running `worker.start()`, the current worker starts listening on the `redis` queue. After this function is executed, whenever there is a new job on the queue that has not been taken by another worker (if any), this worker will take up the job and run the code.

```js
worker.start();
```

### worker.pause() and worker.resume()

You can pause the execution of a worker with the help of the `worker.pause()` function. Executing the `worker.resume()` function resumes processing jobs from the queue.

```js
worker.pause();

worker.resume();
```

The worker performs the following steps in order to execute a program:

- First, the worker builds all the images on the server. If the image is already present, it uses the cache.
- The worker listens on the queue for new jobs.
- Whenever it gets a new job, it calls a `Runner` object to run the code.
- The `Runner` object creates a folder with a random name in `/tmp/code-exec`. This can be changed with the help of the optional `folderPath` parameter passed to the constructor of the `Worker` class.
- This newly-created folder is mounted inside a docker container to execute the code.
- When execution is completed, or the time limit has exceeded, the `worker` responds to the master.


<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/csivitu/code-executor/issues) for a list of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

You are requested to follow the contribution guidelines specified in [CONTRIBUTING.md](./CONTRIBUTING.md) while contributing to the project :smile:.

<!-- LICENSE -->
## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.




<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[csivitu-shield]: https://img.shields.io/badge/csivitu-csivitu-blue
[csivitu-url]: https://csivit.com
[issues-shield]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=flat-square
[issues-url]: https://github.com/csivitu/code-executor/issues

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/roerohan"><img src="https://avatars0.githubusercontent.com/u/42958812?v=4" width="100px;" alt=""/><br /><sub><b>Rohan Mukherjee</b></sub></a><br /><a href="https://github.com/csivitu/code-executor/commits?author=roerohan" title="Code">💻</a> <a href="https://github.com/csivitu/code-executor/commits?author=roerohan" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/ashikka"><img src="https://avatars1.githubusercontent.com/u/58368421?v=4" width="100px;" alt=""/><br /><sub><b>ashikka</b></sub></a><br /><a href="https://github.com/csivitu/code-executor/commits?author=ashikka" title="Code">💻</a> <a href="https://github.com/csivitu/code-executor/commits?author=ashikka" title="Documentation">📖</a></td>
    <td align="center"><a href="https://alias-rahil.github.io/"><img src="https://avatars2.githubusercontent.com/u/59060219?v=4" width="100px;" alt=""/><br /><sub><b>Rahil Kabani</b></sub></a><br /><a href="https://github.com/csivitu/code-executor/commits?author=alias-rahil" title="Code">💻</a> <a href="https://github.com/csivitu/code-executor/commits?author=alias-rahil" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
