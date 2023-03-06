const prevBtn = document.getElementById('prev-card')
const nextBtn = document.getElementById('next-card')
const searchInput = document.getElementById('search-city')
const ulDiv = document.getElementById('select_city_results')
const btngetLocation = document.getElementById('btn-search-city')
const loading = document.getElementById('spin-loading')

let WeatherData

//clear input value when refersh page
searchInput.value = ''


const WeatherAPIReport = async (inputUser) => {
	let coordination

	document.querySelectorAll('warn-message').forEach((el) =>{
		if(!el.hasAttribute('hidden')){
			el.classList.add('hidden')
		}
	})

	if (inputUser === undefined) {
		coordination = getCoordinate()

	} else {
		coordination = inputUser
		//Loading Page
		document.querySelectorAll('.loader-div').forEach((el) => {
			el.classList.remove('hidden')
		})
		document.querySelector('.info-div').classList.add('hidden')

		const data = JSON.parse(await getWeatherApi(coordination))
		const airdata = JSON.parse(await getAirQuality(coordination))
		//TODO: Get Air quality from API
		WeatherData = new WeatherTemp(data)
		WeatherData.allData = data
		WeatherData.setAirdata = airdata
		WeatherData.sevenDaysWeatherReport
		WeatherData.render
		
		//Remove Loading Page
		 setTimeout(() => {
			document.querySelectorAll('.loader-div').forEach((el) => {
				el.classList.add('hidden')
			})
			document.querySelector('.info-div').classList.remove('hidden')
		},2000)

	}
		
}


WeatherAPIReport(undefined)

//Responive View -> 7day tempreature card button action
prevBtn.addEventListener('click', () => {
	document.getElementById('weather-carousel').scrollLeft -= 200;
})

nextBtn.addEventListener('click', () => {
	document.getElementById('weather-carousel').scrollLeft += 200;
})

const logicsSearchInput = async (interact) => {
	ulDiv.classList.remove('hidden')

	if ( document.getElementById('no-city') ) {
        document.getElementById('no-city').remove()  //remove no-city found element
    }

	if ( interact.target.value.length > 2 ) {
		loading.classList.remove('hidden')
		//input user to list location
		await getCityList(interact.target.value).then((data)=>{
			if (data === undefined){
				data = null;
			}
			const isCompleteList = RenderCityList(data)
			if (isCompleteList === true){
				setTimeout(()=> {
					loading.classList.add('hidden')
					document.querySelectorAll('#location-fetched').forEach((element) => {
						element.classList.remove('hidden')
					})
				},3000)
			}
		})
	} else {
		//remove list of location.
		document.getElementById('info-text').classList.remove('hidden')
		if(document.getElementById('city-div')){
			document.querySelectorAll('#city-div').forEach((tag) => {
				tag.remove()
			})
		}
	}
}

/* Search Input Event Listner*/
searchInput.addEventListener('click',() => {
	ulDiv.classList.remove('hidden')
})


//Read Input user and fetch List city
searchInput.addEventListener('keyup', logicsSearchInput)

btngetLocation.addEventListener('click', () => {
	WeatherAPIReport()
})
