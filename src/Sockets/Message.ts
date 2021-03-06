/// <reference path="../typings/tsd.d.ts" />

import OperatorContext from '../OperatorContext';

/**
 * Item message for distributed processing
 */
export default class Message {
    id: number
    clientId: string;
    ctx: OperatorContext;
    tmeoutId: any;
    cb: any //callback function

    FirstOne: boolean;

    Hosts: Array<string>;


    ProcessedTime: number;

    ActualHeuristic: string;
    ActualGlobalTrial: number
    ActualInternalTrial: number
    ActualLibrary: string;
    CleanServer: boolean;
    Shutdown: boolean;
}
