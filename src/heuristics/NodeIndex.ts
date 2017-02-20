
/**
 * Represents a NodeType Index 
 */
export default class NodeIndex {
    /**
     * Tipo de nó (IF, CALL)
     */
    public Type:           string; 
    /**
     * Indice interno atual. Exemplo: IF[1]=396
     */
    public ActualIndex:    number;

    /**
     * Lista os indices. Exemplo IF [0=356, 1=598], Call = [0=356, 1=598]
     */
    public Indexes: number [] = [];   
}