/// <reference path="../../src//typings/tsd.d.ts" />
import IOperator from './IOperator';

import OperatorContext from '../OperatorContext';
import Individual from '../Individual';


/**
 * MutationOperator - Do a node delete over indivudal AST
 */
export default class MutationOperator implements IOperator {
    
    /**
     * Excludes a single random node from individual AST. 
     */
    Execute(conext: OperatorContext, individual: Individual): Individual
    {
        return new Individual();
    }
    
}