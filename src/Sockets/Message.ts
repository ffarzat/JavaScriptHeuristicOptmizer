/// <reference path="../typings/tsd.d.ts" />

import OperatorContext from '../OperatorContext';

/**
 * Item message for distributed processing
 */
export default class Message{
    id: string
    clientId: string;
    ctx: OperatorContext;
    tmeoutId: any;
    cb: any //callback function

    ActualHeuristic: string;
    ActualGlobalTrial: number
    ActualInternalTrial: number
    ActualLibrary: string;
    CleanServer: boolean;
}
