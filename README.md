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

### A.5 Configure the Optimizer for the Library

Return to the Optimizer directory and locate the file "Configuration.json" in the root folder. This is the Optimizer configuration file. In it we will make changes in the values of the following configurations:
* trials: total of desired optimizer runs in the target library;
* logFilePath: path to the log file that will be used during the process;
* tmpDirectory: path to the temporary directory needed to perform the optimization;
* the resultsDirectory: path to the directory where results will be saved at the end of Optimization;
* the heuristics: heuristics that can be used by the Optimizer. The possible values are:
  * RD: ramdon seach;
  * GA: genetic algorithm;
  * HC: hill climbing;
* the clientTimeout: place the observed library execution time here, in seconds, adding up to the value. Example: if the D3-node on the machine where the configuration is running took 3 seconds to run the tests, the configuration value should be 13 seconds;
the clientsTotal: amount of processors available for Optimization. Caution: always leave at least one processor available for the operating system;
* Memory: Amount of memory available for optimization to consume during execution. Upon reaching this limit, the optimizer is automatically knocked over by NodeJS. This setting is in MB;
* libraries: This setting represents a library. You must configure the name, path to the root directory of the target library and its initial file;

### A.6 Execute the optmization process

With the Library and Optimizer environment set up done, run the "npm start" command in the Optimizer root directory. This command will build, run the Optimizer unit tests, and begin the optimization process. This process can take from minutes to hours. At the end of the process, the Optimizer will save a file named "Results.csv" within the directory configured in step A5. In addition, for each configured round, the Optimizer will save a file with the number of the round and extension ".js". For example, "0.js". This file is the optimized code of the library that has been set up.
