# pro-pipe
Pro pipe lets you create pipelines using promises. You give this pipeline the promise returning functions you want in an orderly fashion, set their options so they will behave as you like, and then you can send any data to this pipeline, which will be processed with the order and constraints you gave your promise returning functions with.

Best part of this library is that it uses promises in its internal implementation and there is no magic. It just works! And its easy to work with!

## Example
```
const Pipeline = require('./');

let pipeline = new Pipeline();

pipeline.use(wait(3000, 'first'), { concurrency: 3, timeout: 500 });
pipeline.use(wait(1000, 'second'), { concurrency: 1 });

// Create an array containing numbers from 0 to 9, and calls pipeline.start on them.
[...Array(10).keys()].map((i) => pipeline.start(i).then(console.log));

// Returns a function that returns a promise returning function that resolves the given data to it, after a given ms.
function wait(ms, name){
	return function(data){
		return new Promise((resolve) => {
			setTimeout(() => { 
				console.log(`${name} resolving: ${data}`);
				resolve(data); 
			}, ms);
		});
	};
}
```
This example function will take 3 + 10 seconds to complete. The you can notice the first function that takes 3000 ms, processes the given data in batches of 3. 

## Todo
- Make sure promise func errors doesn't stop the pipeline, and find a good way to pass rejections to the #start.
- Make sure you are using promises where you can internally.
- Add timeout implementation.
