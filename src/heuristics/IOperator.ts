/// <reference path="../../src//typings/tsd.d.ts" />

import OperatorContext from '../OperatorContext';
import Individual from '../Individual';

/**
 * For any Operator inside a Heurisitc
 */
interface IOperator
{
    Execute(conext: OperatorContext, individual: Individual): Individual;
}

export default IOperator