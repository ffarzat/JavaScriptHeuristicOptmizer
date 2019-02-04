# JavaScriptHeuristicOptmizer

A Javascript Heuristic Based Code Optmizer as a part of my PhD.

## How to use the Optimizer for experiments reproduction

In order to do the optimizer setup, to perform an optimization in a JavaScript library, some previous steps and prerequisites are necessary:

1. Install the NodeJs;
2. Download the source code;
3. Perform the installation of the dependencies;
4. Perform the installation of the target Optimizer project;
5. Configure the Optimizer for the Library;
6. Execute the optmization process;

### A.1 Install the NodeJs

The Optimizer was built on the TypeScript language and needs the NodeJS infrastructure for its execution. Access the NodeJS download URL and download your latest version for the platform and operating system you want. After you install it on your computer, perform step A2.

### A.2 Download the source code

To download the Optimizer source code, visit the Github repository URL and download the latest version available. Unzip the downloaded file, and then perform step A3.

### A.3 Perform the installation of the dependencies

In the root folder of the source code (JavaScriptHeuristicOptmizer) open a command terminal and run the following command: "npm install". This command was installed and registered in step A1 during the installation of NodeJS. It will install all the dependencies required to run Optimizer locally. After installing the dependencies, perform step A4.

### A.4 Perform the installation of the target Optimizer project

In this step, the project that will be optimized has to be fully installed and configured to run on the same computer as the Optimizer. In order to optimize a target source code, it is necessary that the target development environment is available and with access to the Optimizer. Choose a library of your choice. For example, we will use a library available on the NPM website, called D3-node. When accessing NPM, there is a link to the library source code repository. Download the latest version of the library. Unzip the downloaded file, and then run the "npm install" command on the terminal for that library. As mentioned in step A3, this command installs the required dependencies for running the library. 

After successful installation, run the "npm test" command. This command will run the tests configured for this library (unit, integration, acceptance, or any other tests configured). Note the time required to run the tests. It will be necessary for the Optimizer configuration. Open the file named "package.json" in the root directory of the optimization project. Look for the property named "main" and note its value. This property points to the library's initial file, that is, its entry point. In the case of the D3-node the file is the index.js, also found in the root directory. With the time required to run the measured tests and with the name of the library input file, we have the information needed to configure the Optimizer
