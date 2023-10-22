
// function for calculating starting x,y center for each spider web based on grid
function calculateGridPos(marginLeft,perRow,pathWidth,i){

	return [(i % perRow + 0.5) * pathWidth+marginLeft, (Math.floor(i / perRow) + 0.5) * pathWidth+50]
}

// function for assigning colors
function determineColors(genres){

	let clean_genres=[]

	clean_genres = genres.includes("Fantasy", "Urban Fantasy") ? clean_genres.concat('Fantasy') : clean_genres;
	clean_genres = genres.includes("Supernatural","Paranormal","Zombies","Ghosts","Vampires") ? clean_genres.concat('Supernatural') : clean_genres;
	clean_genres = genres.includes("Drama","Crime") ? clean_genres.concat('Drama/Crime') : clean_genres;
	clean_genres = genres.includes("Science Fiction","Dystopia","Apocalyptic","Post Apocalyptic") ? clean_genres.concat('Scifi') : clean_genres;
	clean_genres = genres.includes("Thriller","Suspense","Mystery") ? clean_genres.concat('Thriller') : clean_genres;

	return clean_genres
}

// quick function for calculating x,y pairs and translating by the center coordinates
// used in both genSpokePaths and genFilamentPaths
function calcXY(radius,theta,centerXY){

	let x = radius*Math.sin(theta)+centerXY[0]
	let y = radius*Math.cos(theta)+centerXY[1]

	return [x,y]
}

// function for writing spoke pathways based on x,y coordinates
function genSpokePaths(numSpokes,radius,theta,centerXY){

	let spokePaths=""

	for (let i=1; i<=numSpokes; i++){
		let xy_i = calcXY(radius,theta*i,centerXY)
		spokePaths=spokePaths.concat("M",centerXY[0],",",centerXY[1]," L",xy_i[0],",",xy_i[1])
	}
	return spokePaths
}

// function for writing filaments pathways using quadratic cubic bezier based on numAwards, x,y_spokes, inner-ring radii
function genFilamentPaths(radius,theta,sag,centerXY,numRings,numSpokes){

	let radiusShrunk = radius*0.9
	let filamentPaths = ""
	for (let r=1; r<=numRings; r++){


		let radius_r= numRings == 1? radius*Math.random()*0.75+radius/4: radiusShrunk/numRings*r
		let nodes =[]

		for (let i=1; i<=numSpokes; i++){
			let xy_ri = calcXY(radius_r,theta*i,centerXY)

			nodes.push({
				"x":xy_ri[0],
				"y":xy_ri[1],
				"theta":theta*i})
		}

		for (let n=0;n<nodes.length; n++){
			let node_from = nodes[n]
			let node_to = n==(nodes.length-1)? nodes[0] : nodes[n+1]

			let [x_Qrn,y_Qrn] = calcXY(radius_r*sag,node_to.theta-theta/2,centerXY)

			filamentPaths=filamentPaths.concat("M",node_from.x,",",node_from.y," Q",x_Qrn,",",y_Qrn," ",node_to.x,",",node_to.y," ")
		}
	}
	return filamentPaths
}

function combinePaths(spokePath,filamentPath){
	return spokePath.concat(filamentPath)
}

function genSpiderXY(numSpiders, radius_web){

	let theta=2*Math.PI/numSpiders
	let stepTheta = 2*Math.PI/(3*numSpiders)
	let spiderCoords =[]

	for (let i=1; i<=numSpiders; i++){
		let random_r = radius_web*Math.random()*0.7
		let randomTheta = theta*i+Math.random()*2*stepTheta

		spiderCoords.push({x:random_r*Math.sin(randomTheta),y:random_r*Math.cos(randomTheta)})
	}
	return spiderCoords
}