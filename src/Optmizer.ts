import IConfiguration from './IConfiguration';
import IHeuristic from './heuristics/IHeuristic';
import HeuristicFactory from './heuristics/HeuristicFactory';
import ILogger from './ILogger';
import ITester from './ITester';
import IOutWriter from './IOutWriter';
import LogFactory from './LogFactory';
import TesterFactory from './TesterFactory';
import IOutWriterFactory from './IOutWriterFactory';
import Library from './Library';
import TrialResults from './Results/TrialResults';
import Server from './Sockets/Server';
import Message from './Sockets/Message';
import fs = require('fs');

import path = require('path');

var mailer = require("nodemailer");


/**
 * Optmizer
 */
export default class Optmizer {

    configuration: IConfiguration;
    logger: ILogger;
    tester: ITester;
    outter: IOutWriter;
    nodesSelectionApproach: string;
    nodesType: string[] = [];
    heuristics: IHeuristic[] = [];

    heuristicTrial: number;

    public trialIndex: number;

    public server: Server;

    actualHeuristic: IHeuristic;

    Pool: any;

    /**
     * Initializes intire Setup chain
     */
    Setup(Config: IConfiguration, TrialIndex: number, HeuristicTrial: number, ClientsPool: any) {
        this.DoValidation(Config)
        this.configuration = Config;
        this.Pool = ClientsPool;

        this.trialIndex = TrialIndex;
        this.heuristicTrial = HeuristicTrial;

        this.nodesSelectionApproach = this.configuration.trialsConfiguration[this.heuristicTrial].nodesSelectionApproach;
        this.nodesType = this.configuration.trialsConfiguration[this.heuristicTrial].nodesType;

        this.InitializeLogger();
        this.IntializeHeuristics();
    }

    /**
     * Do the configuration object validation
     */
    private DoValidation(config: IConfiguration) {

        if (config.libraries.length == 0) {
            throw " [Optmizer] Needs some Lib to run Improvement Process";
        }

        if (config.logWritter.length == 0) {
            throw " [Optmizer] Needs LogWritter configuration";
        }

        if (!config.trials && config.trials == 0) {
            throw " [Optmizer] Needs Total Trials configuration";
        }

        if (config.heuristics.length == 0) {
            throw " [Optmizer] Needs some Heuristic to run Improvement Process";
        }

    }

    /**
     * Initializes configurated logger class
     */
    private InitializeLogger() {
        this.logger = new LogFactory().CreateByName(this.configuration.logWritter);
        this.logger.Initialize(this.configuration);
    }

    /**
     * Initializes configurated Results Writter
     * 
     */
    private InitializeOutWritter(library: Library, heuristic: IHeuristic) {
        this.outter = new IOutWriterFactory().CreateByName(this.configuration.outWriter);
        this.outter.Initialize(this.configuration, library, heuristic);
    }

    /**
     * Initializes configurated Heuristics
     */
    private IntializeHeuristics() {
        var factory: HeuristicFactory = new HeuristicFactory();

        this.configuration.heuristics.forEach(element => {
            var heuristic = factory.CreateByName(element);
            heuristic.Name = element;
            heuristic.Setup(this.configuration.trialsConfiguration[this.heuristicTrial].especific, this.configuration);
            heuristic.Trials = this.configuration.trials;
            heuristic._logger = this.logger;
            heuristic.Pool = this.Pool;
            this.heuristics.push(heuristic);
        });
    }

    /**
     * Notifies about results of improvement
     */
    private Notify(result: TrialResults) {

        var filepath = path.join(process.cwd(), result.file);
        this.logger.Write(` [Optmizer] Async send Email to notify observers`);
        //this.logger.Write(`File: ${filepath}`);

        var founded: boolean = result.bestIndividualAvgTime < result.originalIndividualAvgTime;

        var smtpTransport = mailer.createTransport("SMTP", {
            service: "Gmail",
            auth: {
                user: "typescript01@gmail.com",
                pass: "Doutorado2016#1"
            }
        });

        var mail = {
            from: "Optmizer <typescript01@gmail.com>",
            to: "fabiofarzat@gmail.com",
            subject: `[Execution Results] ${result.library.name}:${result.heuristic.Name}:${result.trial}`,
            html: `<p>Found new best: <b>${founded}</b>.</p><p>Results file [attached and] saved in: <i>${filepath}</i></p>`,
            attachments: [{ filename: 'results.csv', content: fs.createReadStream(result.file), contentType: 'text/csv' }]
        }


        smtpTransport.sendMail(mail, (error, response) => {
            if (error) {
                this.logger.Write(error);
            } else {
                this.logger.Write(" [Optmizer] Message sent: " + response.message);
            }

            smtpTransport.close();
        });


    }

    /**
    * Initializes intire Improvement Process for a single trial previously configured
    */
    DoOptmization() {

        this.configuration.libraries.forEach(actualLibrary => {
            this.heuristics.forEach(actualHeuristic => {

                this.logger.Write(`Executing trial ${this.trialIndex} for ${actualLibrary.name} with ${actualHeuristic.Name} over heuristic trial ${this.heuristicTrial}`);
                this.logger.Write(`Using nodesSelectionApproach: ${this.nodesSelectionApproach}`);

                this.InitializeOutWritter(actualLibrary, actualHeuristic);

                this.InitializeTester(actualLibrary);

                actualHeuristic._tester = this.tester;
                actualHeuristic.SetLibrary(actualLibrary);
                var resultaForTrial = actualHeuristic.RunTrial(this.trialIndex);

                this.outter.WriteTrialResults(resultaForTrial);
                this.outter.Finish();
                this.Notify(resultaForTrial);
            });
        });
    }


}
