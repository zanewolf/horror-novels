class spiderWebs{
// 	set up the page constraints
	constructor(data,parentElement,legendElement){
		this.data = data[0]
		this.parentElement = parentElement
		this.legendElement = legendElement

		this.initVis()
	}

	initVis(){
		let vis = this;

		// SET UP SVG _________________________
		vis.margin = {top: 0, right: 10, bottom: 0, left: 10};
		vis.fullWidth= window.innerWidth;
		// vis.fullHeight= 6000;
		vis.webWidth =180;
		vis.width = vis.fullWidth - vis.margin.left - vis.margin.right;
		vis.websPerRow=Math.floor(vis.width/(vis.webWidth*2))

		vis.svgMarginLeft = (vis.width-vis.webWidth*2*vis.websPerRow)/4

		vis.minHeight=vis.data.length/vis.websPerRow * (vis.webWidth+250)
		vis.height = vis.minHeight + vis.margin.top + vis.margin.bottom;

		// draw vis svg area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
				.attr("width", vis.width)
				.attr("height", vis.height)
				.attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

		// draw legend svg area
		vis.legendSVG = d3.select("#" + vis.legendElement).append("svg")
				.attr("width", vis.width)
				.attr("height", 1150)
				.attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`)

		vis.legendPostions= {spiders:1000,age: 100,radius: 350,rating:600,awards:825};
				// .attr('style','border-bottom: 10px black')

	// 	SCALES ____________________

	// // 	scale for page number/spokes
	// 	vis.spokeScale = d3.scaleThreshold()
	// 			.range([5,6,7,8,9,10])
	// 			.domain([200,400,600,800,1000]) //determined by looking at histo of raw data
	// //
	// // // 	scale for age/radius
	// 	vis.radiusScale=d3.scaleLog()
	// 			.range([30,150])
	// 			.domain(d3.extent(vis.data,d=>d.age))

		// scale for age  |> spokes
			vis.spokeScale = d3.scaleQuantize()
				.range([10,9,8,7,6])
				.domain(d3.extent(vis.data,d=>d.age)) //determined by looking at histo of raw data

		console.log(vis.spokeScale(180))
		console.log(vis.spokeScale)

		// 	scale for page number  |> radius
		vis.radiusScale=d3.scaleLinear()
				.range([50,150])
				.domain(d3.extent(vis.data,d=>d.pages))

	// 	scale for color/background color
		vis.colorScale=d3.scaleOrdinal()
				.range(["#6108ea","#f14505","#eec005","#08ff08",
					"#ad0101"])
				.domain(['Fantasy','Supernatural','Drama/Crime','Scifi','Thriller'])

	// 	scale for num awards/filament sagginess
	// 	vis.sagScale=d3.scaleLinear()
	// 			.range([0.9,0.15])
	// 			.domain([0,5]) //determined by looking at histo of raw data
	//
	// // 	scale for rating/num rings
	// 	vis.ringScale=d3.scaleQuantize()
	// 			.range([1,2,3])
	// 			.domain(d3.extent(vis.data,d=>d.rating))

		// 	scale for rating  |> sag
		vis.sagScale=d3.scaleLinear()
				.range([0.9,0.1])
				.domain(d3.extent(vis.data,d=>d.rating)) //determined by looking at histo of raw data

		// 	scale for rating/num rings
		vis.ringScale=d3.scaleLinear()
				.range([1,6])
				.domain(d3.extent(vis.data,d=>d.numAwards))

		vis.webData  = vis.data.map((d, i) => {
				return {
					title: d.title,
					author: d.main_author,
					pubYear: d.firstPublishDate.split("/")[2],
					genres: determineColors(d.cleaned_genres),
					numSpokes:vis.spokeScale(d.age),
					theta:2*Math.PI/vis.spokeScale(d.age),
					sag: vis.sagScale(d.rating),
					radius: Math.floor(vis.radiusScale(d.pages)),
					numRings: vis.ringScale(d.numAwards),
					centerXY: calculateGridPos(vis.svgMarginLeft,vis.websPerRow,vis.webWidth,i),
					combinedPaths:null,
					randomRotate: Math.floor(Math.random()*300)
				}
		})

		vis.webData.forEach((d,i)=>{
			d.spiderXYs = genSpiderXY(d.genres.length, d.radius)
			d.combinedPaths=combinePaths(genSpokePaths(d.numSpokes,d.radius,d.theta,d.centerXY),genFilamentPaths(d.radius,d.theta,d.sag,d.centerXY,d.numRings,d.numSpokes))
		})

		vis.spiderSVGPath="M563.3 401.6c2.608 8.443-2.149 17.4-10.62 19.1l-15.35 4.709c-8.48 2.6-17.47-2.139-20.08-10.59L493.2 338l-79.79-31.8l53.47 62.15c5.08 5.904 6.972 13.89 5.08 21.44l-28.23 110.1c-2.151 8.57-10.87 13.78-19.47 11.64l-15.58-3.873c-8.609-2.141-13.84-10.83-11.69-19.4l25.2-98.02l-38.51-44.77c.1529 2.205 .6627 4.307 .6627 6.549c0 53.02-43.15 96-96.37 96S191.6 405 191.6 352c0-2.242 .5117-4.34 .6627-6.543l-38.51 44.76l25.2 98.02c2.151 8.574-3.084 17.26-11.69 19.4l-15.58 3.873c-8.603 2.141-17.32-3.072-19.47-11.64l-28.23-110.1c-1.894-7.543 0-15.53 5.08-21.44l53.47-62.15l-79.79 31.8l-24.01 77.74c-2.608 8.447-11.6 13.19-20.08 10.59l-15.35-4.709c-8.478-2.6-13.23-11.55-10.63-19.1l27.4-88.69c2.143-6.939 7.323-12.54 14.09-15.24L158.9 256l-104.7-41.73C47.43 211.6 42.26 205.1 40.11 199.1L12.72 110.4c-2.608-8.443 2.149-17.4 10.62-19.1l15.35-4.709c8.48-2.6 17.47 2.139 20.08 10.59l24.01 77.74l79.79 31.8L109.1 143.6C104 137.7 102.1 129.7 104 122.2l28.23-110.1c2.151-8.57 10.87-13.78 19.47-11.64l15.58 3.873C175.9 6.494 181.1 15.18 178.1 23.76L153.8 121.8L207.7 184.4l.1542-24.44C206.1 123.4 228.9 91.77 261.4 80.43c5.141-1.793 10.5 2.215 10.5 7.641V112h32.12V88.09c0-5.443 5.394-9.443 10.55-7.641C345.9 91.39 368.3 121 368.3 155.9c0 1.393-.1786 2.689-.2492 4.064L368.3 184.4l53.91-62.66l-25.2-98.02c-2.151-8.574 3.084-17.26 11.69-19.4l15.58-3.873c8.603-2.141 17.32 3.072 19.47 11.64l28.23 110.1c1.894 7.543 0 15.53-5.08 21.44l-53.47 62.15l79.79-31.8l24.01-77.74c2.608-8.447 11.6-13.19 20.08-10.59l15.35 4.709c8.478 2.6 13.23 11.55 10.63 19.1l-27.4 88.69c-2.143 6.939-7.323 12.54-14.09 15.24L417.1 256l104.7 41.73c6.754 2.691 11.92 8.283 14.07 15.21L563.3 401.6z"


		vis.drawVis()
		vis.drawLegend()
	}

	drawVis(){
		let vis = this;

		// draw the webs
		vis.webs=vis.svg.selectAll('g')
				.data(vis.webData)
				.enter()
				.append('g')
				.attr('class','webs')
				.attr("transform",d=>`translate(${d.centerXY[0]},${d.centerXY[1]})`)

		vis.webs
				.append('path')
				.attr('d',d=>d.combinedPaths)
				.attr('stroke','black')
				.attr('stroke-width',2)
				.attr('fill','none')
				.attr('transform',d =>`rotate(${d.randomRotate},${d.centerXY[0]},${d.centerXY[1]})`)

		console.log(vis.webs)
		// add book titles and year
		vis.text=vis.webs.append('text').attr('class','bookTitles')

		vis.text
				.attr("transform",d=>`translate(${d.centerXY[0]},${d.centerXY[1]+175})`)
				.attr('text-anchor', 'middle')
				.style('font-size', '1.25em')
				.style('font-style', 'italic')
				.text(d => `${d.title} (${d.pubYear})`)

		//  add the spiders
		vis.spiders=vis.webs.selectAll('g')
				.data(d=>{
					return _.times(d.genres.length, i => {
						// create a copy of the parent data, and add in calculated rotation
						return Object.assign({}, d,{
							spiderXY:d.spiderXYs[i],
							spiderColor: vis.colorScale(d.genres[i]),
							spiderRotate:Math.floor(Math.random()*300)})
					})
				})
				.enter()
				.append('path')
				.attr('d', vis.spiderSVGPath)
				.attr('transform',d=>`scale(0.05) translate(${(d.centerXY[0]+d.spiderXY.x)*19.5},${(d.centerXY[1]+d.spiderXY.y)*19.95})rotate(${d.spiderRotate})`)
				.attr('fill',d=>d.spiderColor)
				.attr('class','spiders')
				.attr('stroke-width','20px')
		console.log(vis.spiders)

	}

	drawLegend(){
		let vis = this;

	// 	legend for color =>genres
		vis.legendSpiders = vis.legendSVG.append('g')
				.attr('transform',`translate(${vis.width/4},0)`)
				.attr('class','legendSpiders')
				.selectAll('.legendSpiders')
				.data(['Fantasy','Thriller','Scifi','Supernatural','Drama/Crime'])
				.enter()
				.append('g')
				.attr('transform',(d,i)=>`translate(${vis.width/9*i},${vis.legendPostions.spiders})`)

		vis.legendSpiders.append('path')
				.attr('class','spiders')
				.attr('d', vis.spiderSVGPath)
				.attr('transform',d=>`scale(0.1)`)
				.attr('fill',d=>vis.colorScale(d))
				.attr('stroke-width','10px')


		vis.legendSpiders.append('text')
				.attr('class','labels')
				.text(d=>d)
				.attr('text-anchor', 'middle')
				.attr('transform','translate(27,90)')
				.attr('font-size','1.25em')

	// 	legend for size => page number
		vis.legendRadius = vis.legendSVG.append('g')
				.attr('class','radiusWeb')
				.attr('transform',`translate(${vis.width/4-10},${vis.legendPostions.radius})`)
				.selectAll('.radiusWeb')
				.data([200,600,1000])
				.enter()
				.append('g')
				.attr('transform',(d,i)=>`translate(${vis.width/4*i},0)`)

		vis.legendRadius.append('path')
				.attr('d',d=>combinePaths(genSpokePaths(6,vis.radiusScale(d),Math.PI/3,[0,0]),genFilamentPaths(vis.radiusScale(d),Math.PI/3,0.8,[0,0],3,6)))
				// .attr('transform',(d,i)=>`translate(${vis.width/4*i},0)`)
				// .attr('fill',d=>vis.colorScale(d))
				.attr('stroke','black')
				.attr('stroke-width',2)
				.attr('fill','none')

		vis.legendRadius.append('text')
				.attr('class','labels')
				.text((d,i)=>['200 pages','600 pages','1000 pages'][i])
				.attr('text-anchor', 'middle')
				.attr('transform','translate(0,150)')
				.attr('font-size','1.25em')

	// 	legend for spoke number  => age
		vis.legendSpokes = vis.legendSVG.append('g')
				.attr('class','spokeWeb')
				.attr('transform',`translate(${vis.width/6},${vis.legendPostions.age})`)
				.selectAll('.spokeWeb')
				.data([10,9,8,7,6])
				.enter()
				.append('g')
				.attr('transform',(d,i)=>`translate(${vis.width/6*i},0)`)

		vis.legendSpokes.append('path')
				.attr('d',(d,i)=>combinePaths(genSpokePaths(d,vis.radiusScale(400),2*Math.PI/d,[0,0]),genFilamentPaths(vis.radiusScale(400),2*Math.PI/d,0.8,[0,0],3,d)))// .attr('transform',(d,i)=>`translate(${vis.width/4*i},0)`)
				// .attr('fill',d=>vis.colorScale(d))
				.attr('stroke','black')
				.attr('stroke-width',2)
				.attr('fill','none')

		vis.legendSpokes.append('text')
				.attr('class','labels')
				.data(['10+ years old','70+ years','110+ years','140+ years','180+ years'])
				.text(d=>d)
				.attr('text-anchor', 'middle')
				.attr('transform','translate(0,100)')
				.attr('font-size','1.25em')


	// 	legend for filament sagginess  => rating


		vis.legendSag = vis.legendSVG.append('g')
				.attr('class','sagWeb')
				.attr('transform',`translate(${vis.width/3},${vis.legendPostions.rating})`)
				.selectAll('.sagWeb')
				.data([d3.min(vis.data,d=>d.rating),d3.max(vis.data,d=>d.rating)])
				.enter()
				.append('g')
				.attr('transform',(d,i)=>`translate(${vis.width/3*i},0)`)

		vis.legendSag.append('path')
				.attr('d',d=>combinePaths(genSpokePaths(6,vis.radiusScale(400),2*Math.PI/6,[0,0]),genFilamentPaths(vis.radiusScale(400),2*Math.PI/6,vis.sagScale(d),[0,0],2,6)))// .attr('transform',(d,i)=>`translate(${vis.width/4*i},0)`)
				// .attr('fill',d=>vis.colorScale(d))
				.attr('stroke','black')
				.attr('stroke-width',2)
				.attr('fill','none')

		vis.legendSag.append('text')
				.attr('class','labels')
					.data([`${d3.min(vis.data,d=>d.rating)}/5 rating`,`${d3.max(vis.data,d=>d.rating)}/5 rating`])
				.text(d=>d)
				.attr('text-anchor', 'middle')
				.attr('transform','translate(0,100)')
				.attr('font-size','1.25em')

		// 	legend for ring number => num awards

		vis.legendRings = vis.legendSVG.append('g')
				.attr('class','ringWeb')
				.attr('transform',`translate(${vis.width/7},${vis.legendPostions.awards})`)
				.selectAll('.ringWeb')
				.data([0,1,2,3,4,5])
				.enter()
				.append('g')
				.attr('transform',(d,i)=>`translate(${vis.width/7*i},0)`)

		vis.legendRings.append('path')
				.attr('d',d=>combinePaths(genSpokePaths(6,vis.radiusScale(400),2*Math.PI/6,[0,0]),genFilamentPaths(vis.radiusScale(400),2*Math.PI/6,0.6,[0,0],vis.ringScale(d),6)))// .attr('transform',(d,i)=>`translate(${vis.width/4*i},0)`)
				// .attr('fill',d=>vis.colorScale(d))
				.attr('stroke','black')
				.attr('stroke-width',2)
				.attr('fill','none')

		vis.legendRings.append('text')
				.attr('class','labels')
				.data([`0 awards`,'1 award','2 awards','3 awards','4 awards','5 awards'])
				.text(d=>d)
				.attr('text-anchor', 'middle')
				.attr('transform','translate(0,100)')
				.attr('font-size','1.25em')




	}

}