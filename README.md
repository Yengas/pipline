# pipline
Pipline lets you create pipelines using promises. You give this pipeline the promise returning functions you want in an orderly fashion, set their options so they will behave as you like, and then you can send any data to this pipeline, which will be processed with the order and constraints you gave your promise returning functions with.

Best part of this library is that it uses promises in its internal implementation and there is no magic. It just works! And its easy to work with!

## Example
```
const Pipeline = require('./');

let pipeline = new Pipeline();

// You can also chain #use methods, since #use returns `this`.
pipeline.use(waitAndReturn, { concurrency: 3, timeout: 3500 });
pipeline.use(printAndWait, { concurrency: 1 });

// Create an array containing numbers from 0 to 9, and calls pipeline.start on them.
for(let i = 0; i < 10; i++){
	pipeline.start(i)
		.then((res) => console.log("Result: ", res))
		.catch((err) => console.log("Error: ", err));
}

// Returns a promise that resolves after 3 seconds.
function waitAndReturn(i){
	console.log(`Wait and return called with: ${i}`);
	return new Promise((resolve) => setTimeout(() => resolve(i), 3000));
}

function printAndWait(i){
	return new Promise((resolve) => {
		console.log(`PrintAndWait prints ${i}`);
		setTimeout(() => resolve(i), 1000);
	});	
}
```
This example function will take 3 + 10 seconds to complete. You can notice the first function that takes 3000 ms, processes the given data in batches of 3. 
