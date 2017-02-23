/**
 * Contador de Clientes
 */
class SingletonCounter {

    private contador: number;

    constructor() {
        this.contador = 0;
    }


    /**
     * SingletonCounter +1
     */
    Get(): number {
        return this.contador++;
    }
}

export default SingletonCounter;