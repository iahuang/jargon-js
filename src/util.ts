class RandomSampler {
    choices: any[] = [];
    weights: number[] = [];
    private _markers: number[] = [];

    constructor() {

    }

    add(choice: any, weight: number = 1) {
        this.choices.push(choice);
        this.weights.push(weight);

        // compile markers
        this._markers = [];
        let sumWeights = 0;
        for (let w of this.weights) {
            sumWeights+=w;
        }
        let currMarker = 0;
        for (let w of this.weights) {
            currMarker+=w;
            this._markers.push(currMarker/sumWeights);
        }

        return this; // allow function chaining
    }

    sample() {
        let n = Math.random();

        for (let i=0; i<this.choices.length; i++) {
            let marker = this._markers[i];
            let choice = this.choices[i];

            if (n < marker) {
                return choice;
            }
        }
        throw new Error("");
    }
}