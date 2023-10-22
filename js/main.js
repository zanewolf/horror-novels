let promise = [
		d3.json("data/horror_novels.json")
]

Promise.all(promise)
		.then( function(data){ new spiderWebs(data,"spiderwebs", "legend") })
		.catch( function (err){console.log(err)} );

