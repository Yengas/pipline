const Pipeline = require('../');

describe('Pipeline Test Suite', () => {
	describe('Pipeline Concurrency', () => {
		it('should run atmost n instances of a pipe', (done) => {
			let pipeline = new Pipeline(), concurrency = 2, limit = 10;
			pipeline.use((i) => {
				return Promise.resolve(i == limit);
			}, { concurrency });
			for(let i = 0; i <= 10; i++){
				pipeline.start(i).then((res) => {
					if(pipeline.funcs[0].current > concurrency) return done('Too much running at the same time.');
					return res ? done() : false; 
				}).catch(done);
			}					
		});
	});

	describe('Pipeline Timeout', () => {
		it('should timeout after a given amount of time', (done) => {
			let pipeline = new Pipeline();
			pipeline.use(() => new Promise(), { timeout: 100 });
			pipeline.start().catch(() => done());	
		});
	});

	describe('Pipeline Process', () => {
		it('should handle functions not returning promises', () => {
			let pipeline = new Pipeline();
			pipeline.use(() => true);
			pipeline.start().catch(() => done());
		});

		it('should handle functions throwing exceptions', (done) => {
			let pipeline = new Pipeline();
			pipeline.use(() => { throw new Error(); });
			pipeline.start().catch(() => done());
		});
	});
});
