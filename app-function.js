const getWeatherApi = async (coordinate) => {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${coordinate}&hourly=relativehumidity_2m,visibility&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,windspeed_10m_max,winddirection_10m_dominant&current_weather=true&timezone=auto`);
        if (response.status === 200){
            const data = await response.json();
            const WeatherData = JSON.stringify(data)
            return WeatherData
        }
    } catch (error) {
        console.log(err)
        //TODO: Show Error On site.
    }
}

const getAirQuality = async (coordinate) => {
    const response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${coordinate}&hourly=european_aqi&domains=cams_global&timezone=auto`)
    try {
        if (response.status === 200){
            const airqData = JSON.stringify(await response.json())
            return airqData
        }
    } catch (error) {
        console.log(err)
        //TODO: Show Error On site.
    }
    
}

const getCityList = async (cityName) => {
    const query = null
    if (query === cityName){
        return
    }

    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`)
        if(response.status === 200){
            const data = await response.json();
            return data.results
        }
    } catch (error) {
        console.log(err)
        //TODO: Show Error On site.
    }
}

const RenderCityList = (CityList) => {

    document.getElementById('info-text').classList.add('hidden')

    if (document.getElementById('no-city') ){
        document.getElementById('no-city').remove()  //remove no-city found element
    }

    if (document.getElementById('city-div')){
        document.querySelectorAll('#city-div').forEach((tag) => {
            tag.remove()
        })
    }
    
    //if results is empty.
    if(CityList === null){
        loading.classList.add('hidden')

        const nocityEl = document.createElement('li')
        nocityEl.setAttribute('id','no-city')
        nocityEl.setAttribute('class',' w-60')
        ulDiv.append(nocityEl)
        
        const nocitySpan = document.createElement('span')
        nocitySpan.setAttribute('class','no_city px-2')
        nocitySpan.innerText = 'No locations found'
        nocityEl.append(nocitySpan)
        
        return
    }
    
    //Results of list location
    CityList.forEach( element => {
        
        const citylistDiv = document.createElement('div')
        citylistDiv.setAttribute('id','city-div')
        citylistDiv.innerHTML = `
        <li id="location-fetched" class="hover:bg-light-grey cursor-pointer hidden">
                <a id="location-select" class="dropdown-item inline-block p-2" href="#" data-coordinate="latitude=${element.latitude.toFixed(2)}&longitude=${element.longitude.toFixed(2)}" data-country="${element.country}" data-city="${element.name}">                                                           
                <img class="inline-block h-6" src="images/country-flags/${element.country_code.toLowerCase()}.svg" title="${element.name}"/> 
                ${element.name} <small class="text-muted">${element.admin1}(${element.latitude.toFixed(2)}°E ${element.longitude.toFixed(2)}°N ${element.elevation}m asl)</small>
            </a>
        </li> `
        ulDiv.appendChild(citylistDiv)

    });
    //in location list input actions
    clickCityList()

    return true
}

const generateMapValue = (num, inmin, inmax, outmax, outmin) => {
    return (num - inmin) * (outmax - outmin) / (inmax - inmin) + outmin
}

//get your longitude and latitude
const getCoordinate = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (success) => {
            //Loading Page
            document.querySelectorAll('.loader-div').forEach((el) => {
                el.classList.remove('hidden')
            })
            document.querySelector('.info-div').classList.add('hidden')
            
            //geolocation
            const latitude = success.coords.latitude
            const longitude = success.coords.longitude
            const coordination = `latitude=${latitude.toFixed(2)}&longitude=${longitude.toFixed(2)}`
            
            //left side location dom
            document.getElementById('current-city-name').innerText = `Long: ${longitude} Lati: ${latitude}`
            document.getElementById('current-location').innerText = 'World'

            const data = JSON.parse(await getWeatherApi(coordination))
            const airdata = JSON.parse(await getAirQuality(coordination))
            
            //class declare
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
            
            searchInput.value = ''
            
        },geolocationErrorHandle)
    } else {
        alert('Geolocation is not supported on this browser.')
    }
}

//error handling from geolocation
const geolocationErrorHandle = (err) => {
    switch(err.code) {
        case err.PERMISSION_DENIED:
        alert("User denied the request for Geolocation.")
          break;
        case err.POSITION_UNAVAILABLE:
          alert("Location information is unavailable.")
          break;
        case err.TIMEOUT:
          alert("The request to get user location timed out.")
          break;
        case err.UNKNOWN_ERROR:
          alert("An unknown err occurred.")
          break;
      }
}

const clickCityList = () => {
    //to get all location list
    document.querySelectorAll('#location-fetched').forEach((el) => {
        //click listener
        el.addEventListener('click', (e) => {
            //to remove warn message in case wrong way.
            document.querySelectorAll('warn-message').forEach((el) =>{
                if(!el.hasAttribute('hidden')){
                    el.classList.add('hidden')
                }
            })

//              if (e.target.dataset.coordinate === undefined){
                
//                 //if dom target is not found, alternative target mode.
//                 if(e.explicitOriginalTarget.dataset.coordinate !== undefined){
//                     document.querySelectorAll('#warn-message').forEach((element) =>{
//                         element.classList.remove('activated')
//                     })

//                     document.getElementById('current-location').innerText = e.explicitOriginalTarget.dataset.country
//                     document.getElementById('current-city-name').innerText = e.explicitOriginalTarget.parentElement.dataset.city
//                     WeatherAPIReport(e.explicitOriginalTarget.dataset.coordinate)
//                 }

                //else not to try.
//                 document.querySelectorAll('#warn-message').forEach((element) =>{
//                     element.classList.add('activated')
//                 })
//                 return
//             } else{
                //fetched results.
                document.querySelectorAll('#warn-message').forEach((element) =>{
                    element.classList.remove('activated')
                })
            
                console.log(e.target.dataset.country);
                console.log(e.target.dataset.city);
                //location in left div
                document.getElementById('current-location').innerText = e.target.dataset.country
                document.getElementById('current-city-name').innerText = e.target.dataset.city

                WeatherAPIReport(e.target.dataset.coordinate)
//             }
        })
    })
}

