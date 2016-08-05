// wait returns a function that waits on the given context and runs functions.
function wait(context){
	return function(func){
		// We wouldn't want to process an undefined/non function.
		if(!func || func.constructor != Function) return false;
		let { current, concurrency } = context.options;

		// If we don't need to wait...
		if(!concurrency || concurrency == -1 || (current || 0) < concurrency){
			// Increment the current counter and run the function.
			context.options.current = (context.options.current || 0) + 1;
			return func();
		}

		// ..else add to the waiting list.
		if(!context.waiting) context.waiting = [];
		context.waiting.push(func);
	};
}

// release returns a function that executes when an instance of function finishes.
function release(context){
	return function(){
		// Increment the current counter...
		context.options.current -= 1;
		// ...execute the first in line from the waiting list.
		return wait(context)(context.waiting.shift());
	};
}

class Pipeline{
	/**
		use adds a given promise returning function with the given options to the pipeline.
		@param promiseFunc Function a function that takes an input and returns a promise.
		@param options Object an object that contains pipe options like concurrency, timeout etc.
	**/
	use(promiseFunc, options){
		if(!this.funcs) this.funcs = [];
		let context = Object.assign(
			{ options: { concurrency: -1, timeout: -1 }},
			{ options }
		);
		this.funcs.push(
			Object.assign({
				wait: wait(context),
				release: release(context),
			}, {promiseFunc})
		);
	}

	/**
		_execute is used internally by #start method to start the execution chain.
		this function takes an index representing where the data is at in the pipeline and runs that function when it can.
		@param index Number pipeline execution instance.
		@param data Object an object containing the latest processed/gotten output.
		@param resolve Function to call when the pipeline execute finishes.
		@return Promise
	**/
	_execute(index, data, resolve){
		// Call the resolve function if we're finished with the pipeline.
		if(index >= this.funcs.length) return resolve(data);
		// current function.
		let pipe = this.funcs[index]; 

		// wait until we can execute this function(e.g. wait for instances of this function to finish.)
		pipe.wait(() => { 
			// Call the promise func.
			pipe.promiseFunc(data)
				// Release on catch too.
				.then((data) => { 
					// Release an instance of this function, so waiting functions can start.
					pipe.release();
					// Execute the next pipe in line.
					return this._execute(index + 1, data, resolve);
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
		return new Promise(resolve => this._execute(0, data, resolve));
	}
}

module.exports = Pipeline;
