class MyClass {

	constructor() {
		this.n = 0;
	}

	performEval() {
		const string = "this.inc(17)";
		const output = eval(string);
		console.log(output);
	}

	inc(x) {
		this.n += x;
		return this.n;
	}

}

obj = new MyClass();

obj.performEval();
obj.performEval();
obj.performEval();
obj.performEval();
