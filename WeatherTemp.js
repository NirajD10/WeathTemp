class WeatherTemp {
    constructor(data){
        this.weathereport = data
        this.sevenweatherdata = {
            maximumTemp : [],
            minimumTemp : [],
            weatherCode: [],
            day: [],
        }
        this.tempreature = this.#getCurrentTempreature()
        this.time = {
            day : '',
            ctime: ''
        }
        this.uvindex = this.#getUVIndex()
        this.currentWeatherCode = this.#todayWeatherCode()
        this.windreport = {
            winddirection : '',
            windspeed : 0
        }
        this.suntime = {
            sunrisetime : '',
            sunsettime: ''
        }
        this.humidity = this.#getWeatherConditionByInput('relativehumidity_2m')
        this.visibility = this.#getWeatherConditionByInput('visibility')
        this.airquality

    }

    #getCurrentTempreature() {
        return this.weathereport.current_weather.temperature
    }
    
    #todayWeatherCode() {
        return this.weathereport.current_weather.weathercode
    }

    #getUVIndex() {
        return this.weathereport.daily.uv_index_max[0]
    }

    #getWeatherConditionByInput(input_type) {
        let objectElement = input_type === 'relativehumidity_2m' ? this.weathereport.hourly.relativehumidity_2m
                            : this.weathereport.hourly.visibility 
                            
        let dayCollectionData = [],
          count = 0

        for (let i =0; i<= 24; i++) {
            dayCollectionData.push(objectElement[i])
        }

        dayCollectionData.forEach((data) => {
            count += data
        })

        if (input_type === 'visibility') {
            return ((count/24) / 1000).toFixed(2)
        }

        return Math.floor(count/24)
    }

    set allData(data){
        //current weekday and time
        let options = {
            weekday: "long",
            hour: "numeric",
            minute: "numeric"
        }

        let gettime = new Date(this.weathereport.current_weather.time)
        const currentDay = new Intl.DateTimeFormat("en-US", options).format(gettime).split(' ')
        this.time.day = currentDay[0]
        this.time.ctime = currentDay[1] + currentDay[2]

        //sunset and sunrise time
        let sec_options = {
            hour: "numeric",
            minute: "numeric"
        }
        gettime = new Date(this.weathereport.daily.sunrise[0])                           //sunrise
        const currentSunrise = new Intl.DateTimeFormat("en-us", sec_options).format(gettime)
        this.suntime.sunrisetime = currentSunrise

        gettime = new Date(this.weathereport.daily.sunset[0])                            //sunset
        const currentSunset = new Intl.DateTimeFormat("en-us", sec_options).format(gettime)
        this.suntime.sunsettime = currentSunset

        //Wind details
        this.windreport.windspeed = this.weathereport.daily.windspeed_10m_max[0]
        this.windreport.winddirection = getWindDirections(this.weathereport.daily.winddirection_10m_dominant[0])

        //7-Days Weather Report
        this.sevenweatherdata.maximumTemp = [...this.weathereport.daily.temperature_2m_max]
        this.sevenweatherdata.minimumTemp = [...this.weathereport.daily.temperature_2m_min]

        let sevendaysformat = {
            weekday: "short"
        }

        this.weathereport.daily.time.forEach((date) => {
            gettime = new Date(date)
            const shortDayofsevenweather = new Intl.DateTimeFormat("en-us",sevendaysformat).format(gettime)
            this.sevenweatherdata.day.push(shortDayofsevenweather)
        })

        //Weather Image Code 
        document.querySelectorAll('#status-code-icon').forEach((code) => {
            code.src = `images/${getWeatherCodeImage(this.currentWeatherCode.toLowerCase() ,currentDay[1], currentDay[2])}.svg`
        })

        //copy constructor from api weather code
        this.sevenweatherdata.weatherCode = [...this.weathereport.daily.weathercode]
        //7Day Weather Image Code
        const dailyWeatherCodeEl = document.querySelectorAll('#weekly-status-code')
        dailyWeatherCodeEl.forEach((code, key) => {
            code.src = `images/${getWeatherCodeImage(this.sevenweatherdata.weatherCode[key].toLowerCase() ,currentDay[1], currentDay[2])}.svg`
        })
    }

    set setAirdata(airdata) {
        let airqualityDay = [],
            total = 0
        
        for (let i=0; i < 24; i++){
            airqualityDay.push(airdata.hourly.european_aqi[i])
        }

        airqualityDay.forEach((data) => {
            total += data
        })

        this.airquality = Math.floor(total/24)
    }

    get sevenDaysWeatherReport () {
        const dailyDayEl = document.querySelectorAll('#weekly-day')
        const dailyMaxTempEl = document.querySelectorAll('#weekly-max-temp')
        const dailyMinTempEl = document.querySelectorAll('#weekly-min-temp')

        for(let i = 0; i< this.sevenweatherdata.maximumTemp.length; i++){
            dailyMaxTempEl[i].firstChild.data = Math.floor(this.sevenweatherdata.maximumTemp[i])
            dailyMinTempEl[i].firstChild.data = Math.floor(this.sevenweatherdata.minimumTemp[i])
            dailyDayEl[i].innerText = this.sevenweatherdata.day[i]
            //TODO: Weather Image Code 
        }
    }

    get render() {
        /****
        *** set allData() is function to set data in constructor.    ***
        *** therefore once allData() func is executed then render() func [object] called.  ***
        ****/

    	ulDiv.classList.add('hidden')

        //Current Tempreature div
        const weatherTempDiv = document.getElementById('current-temp')
        weatherTempDiv.firstChild.textContent = Math.floor(this.tempreature)

        //Current day and time div
        const currentDayEl = document.getElementById('current-date')
        currentDayEl.firstChild.textContent = this.time.day
        currentDayEl.lastChild.textContent = this.time.ctime

        //Uv Index card
        const uvindexEl = document.getElementById('uv-index')
        uvindexEl.innerText = this.uvindex
            /* UV Index Circular-Bar-Update */
        const chartBarValue = generateMapValue(this.uvindex,1,14,135,-45)
        let charCircularBar = document.querySelector('.circular-graph')
        charCircularBar.style.setProperty("--circular-deg", chartBarValue+'deg');


        //Humidity card
        const humidityEl = document.getElementById('humidity')
        humidityEl.firstChild.textContent = this.humidity
            /* Humidity Bar */
        const humidityBarValue = generateMapValue(this.humidity,0,100,70,0)
        let humidityBar = document.getElementById('humidity-result-bar')
        humidityBar.style.setProperty("--translatecir", Math.floor(humidityBarValue)+'px')
        //TODO: Need function call status.


        //Visibility card
        const visibilityEl = document.getElementById('visibility')
        visibilityEl.firstChild.textContent = this.visibility

        //Sunrise and Setset Card
        const sunriseEl = document.getElementById('current-sunrise')
        sunriseEl.innerText = this.suntime.sunrisetime
        const sunsetEl = document.getElementById('current-sunset')
        sunsetEl.innerText = this.suntime.sunsettime

        //Wind card
        const windspeedEl = document.getElementById('wind-status')
        windspeedEl.firstChild.textContent = this.windreport.windspeed
        const winddirectionEl = document.getElementById('wind-direction')
        winddirectionEl.innerText = this.windreport.winddirection
        
        //Air Quality Card
        const airqualityEl = document.getElementById('air-quality')
        airqualityEl.textContent = this.airquality
            /* Air Quality Bar */
        let airquality
        if(this.airquality > 100) {
            airquality = 100
        } else {
            airquality = this.airquality
        }
        const airqualityBarValue = generateMapValue(airquality,0,100,70,0)
        let airqualityBar = document.getElementById('air-quality-result-bar')
        airqualityBar.style.setProperty("--translatecir", Math.floor(airqualityBarValue)+'px')
        //air quality status
        document.getElementById('air-quality-code').classList.remove('bg-green-500','bg-lime-500','bg-yellow-500','bg-orange-500','bg-red-600','bg-purple-900')
        const airqualityStatusObj = statusMessage('air quality', this.airquality)
        document.getElementById('air-quality-code').classList.add(`${airqualityStatusObj.color}`)
        document.getElementById('air-quality-code').innerText = airqualityStatusObj.message
    }
}


//wind direction of cardinal degree
const getWindDirections = (degreeData) => {
    switch(true){
        case  degreeData > 0 && degreeData < 11.25:
            return 'N'
        case 11.25 > degreeData && degreeData < 33.75:
            return 'NNE' 
        case 33.75 > degreeData && degreeData < 56.25:
            return 'NE'
        case 56.25 > degreeData && degreeData < 78.75:
            return 'ENE'
        case 78.75 > degreeData && degreeData < 101.25:
            return 'SE'
        case 101.25 > degreeData && degreeData < 123.75:
            return 'ESE'
        case 123.75 > degreeData && degreeData < 146.25:
            return 'SE'
        case 146.25 > degreeData && degreeData < 168.75:
            return 'SSE'
        case 168.75 > degreeData && degreeData < 191.25:
            return 'S'
        case 191.25 > degreeData && degreeData < 213.75:
            return 'SSW'
        case 213.75 > degreeData && degreeData < 236.25:
            return 'SW'
        case 236.25 > degreeData && degreeData < 258.75:
            return 'WSW'
        case 258.75 > degreeData && degreeData < 281.25:
            return 'W'
        case 281.25 > degreeData && degreeData < 303.75:
            return 'WNW'
        case 303.75 > degreeData && degreeData < 326.25:
            return 'NW'
        case 326.25 > degreeData && degreeData < 348.75:
            return 'NNW'
        default : 
            return 'Unknown'
    }
}

const statusMessage = (weathertype, weatherValue)  => {
    if ( weathertype === 'air quality') {
        switch(true){
            case weatherValue > 0 && weatherValue <= 20 :
                return {
                    message: 'Good',
                    color: 'bg-green-500'
                }
            case weatherValue > 20 && weatherValue <= 40 :
                return {
                    message: 'Fair',
                    color: 'bg-lime-500'
                }
            case weatherValue > 40 && weatherValue <= 60 : 
                return {
                    message: 'Moderate',
                    color: 'bg-yellow-500'
                }
            case weatherValue > 60 && weatherValue <= 80 :
                return {
                    message: 'Poor',
                    color: 'bg-orange-500'
                }
            case weatherValue > 80 && weatherValue <= 100 :
                return {
                    message: 'Very Poor',
                    color: 'bg-red-600'
                }
            case weatherValue > 100:
                return {
                    message: 'Extremely Poor',
                    color: 'bg-purple-900'
                }
        }
    } else {
        switch(true){
            default :
                return 'Unknown'
        }
    }
}

const getWeatherCodeImage = (weatherFetchedcode,time,timezone) => {
    const weatherdaynnight = [0,1,2,56,57,85,86]

    //split time to num (but its has string format)
    let arrayTime = time.split(":")
    //string to num conversion
    let arrNumTime = arrayTime.map(Number)
    
    console.log(arrNumTime[0])
    console.log(timezone)

    if(weatherdaynnight.includes(weatherFetchedcode) === true){
        if (timezone === 'AM') {
            if (arrNumTime[0] >= 6 && arrNumTime[0] <= 12){
                return `${weatherFetchedcode}-day`
            } else {
                return `${weatherFetchedcode}-night`
            }
        } else {
            if ( arrNumTime[0] >= 12 || arrNumTime[0] < 7){
                console.log('Correct code')
                return `${weatherFetchedcode}-day`
            } else {
                console.log('incorrect code')
                return `${weatherFetchedcode}-night`
            }
        }
    } else {
        return `${weatherFetchedcode}`
    }
}
