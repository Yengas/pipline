const Pipeline = require('./');

let pipeline = new Pipeline();

pipeline.use(wait(3000), { concurrency: 3, timeout: 500 });
pipeline.use(wait(1000), { concurrency: 1 });

[...Array(10).keys()].map((i) => pipeline.start(i).then(console.log));

function wait(ms){
	return function(data){
		return new Promise((resolve) => {
			setTimeout(() => resolve(data), ms);
		});
	};
}
