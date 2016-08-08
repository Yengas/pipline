const Pipeline = require('./');

let pipeline = new Pipeline();

pipeline.use(wait(3000, 'first'), { concurrency: 3, timeout: 500 });
pipeline.use(wait(1000, 'second'), { concurrency: 1 });

[...Array(10).keys()].map((i) => pipeline.start(i).then(console.log));

function wait(ms, name){
	return function(data){
		console.log(`${name} is called with ${data}.`);
		return new Promise((resolve) => {
			setTimeout(() => { 
				console.log(`${name} resolving ${data}.`);
				resolve(data);
			}, ms);
		});
	};
}
