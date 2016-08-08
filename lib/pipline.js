/**
	timeout returns a promise that rejects after a given time.
	@param ms Number time to reject after waiting.
	@return Promise
**/
function timeout(ms){
	return new Promise((_, reject) => {
		setTimeout(() => reject(`Timeout ${ms} ms.`), ms);
	});
}

class Pipe{
	constructor(promiseFunc, options){
		this.options = options;
		this.current = 0;
		this.waiting = [];
		this.promiseFunc = promiseFunc;	
	}

	// wait waits until it can run a function and then runs it.
	wait(func){
		if(!func || func.constructor != Function) return false;
		let { concurrency } = this.options;

		// If we don't need to wait...
		if(!concurrency || concurrency == -1 || this.current < concurrency){
			// Increment the current counter and run the function.
			this.current = this.current + 1;
			return func();
		}

		// ..else add to the waiting list.
		this.waiting.push(func);
	}

	// release decrements the current when an instance of function finishes.
	release(){
		this.current = Math.max(this.current - 1, 0);
		// ...execute the first in line from the waiting list.
		return this.wait(this.waiting.shift());
	}
}

class Pipeline{
	/**
		use adds a given promise returning function with the given options to the pipeline.
		@param promiseFunc Function a function that takes an input and returns a promise.
		@param options Object an object that contains pipe options like concurrency, timeout etc.
	**/
	use(promiseFunc, _options){
		if(!this.funcs) this.funcs = [];
		let options = Object.assign({ concurrency: -1, timeout: -1 }, _options);
		this.funcs.push(new Pipe(promiseFunc, options));
		return this;
	}

	/**
		_execute is used internally by #start method to start the execution chain.
		this function takes an index representing where the data is at in the pipeline and runs that function when it can.
		@param index Number pipeline execution instance.
		@param data Object an object containing the latest processed/gotten output.
		@param resolve Function to call when the pipeline execute finishes.
		@return Promise
	**/
	_execute(index, data, resolve, reject){
		// Call the resolve function if we're finished with the pipeline.
		if(index >= this.funcs.length) return resolve(data);
		// current function.
		let pipe = this.funcs[index]; 

		// wait until we can execute this function(e.g. wait for instances of this function to finish.)
		pipe.wait(() => { 
			// Call the promise func.
			let result;

			// Don't trust the pipe function.
			try{
				result = pipe.promiseFunc(data);
			}catch(e){}

			// Reject if the returned value is not a promise.
			if(!result || result.constructor !== Promise) reject(result);

			// Timeout if a timeout is given. 
			if(pipe.options.timeout > 0)
				result = Promise.race([result, timeout(pipe.options.timeout)]);

			result.then((data) => { 
				// Release an instance of this function, so waiting functions can start.
				pipe.release();
				// Execute the next pipe in line.
				return this._execute(index + 1, data, resolve, reject);
			}).catch((error) => {
				pipe.release();	
				reject(error);
			});
		});
	}

	/**
		start starts the pipeline process with the given data,
		and returns a promise that resolves when the pipeline execution finishes.
		@param data Object data to start the pipeline execution with.
		@return Promise
	**/
	start(data){
		return new Promise((resolve, reject) => this._execute(0, data, resolve, reject));
	}
}

module.exports = Pipeline;
