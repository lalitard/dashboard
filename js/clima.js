let plot = (data) => {
  const ctx = document.getElementById('myChart');

  const dataset = {
    labels: data.hourly.time, /* ETIQUETA DE DATOS */
    datasets: [{
      label: 'Temperatura semanal', /* ETIQUETA DEL GRÁFICO */
      data: data.hourly.temperature_2m, /* ARREGLO DE DATOS */
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const config = {
    type: 'line',
    data: dataset,
  };

  const chart = new Chart(ctx, config)
}

let load = (data) => {

  let timezoneVar = data["timezone"];
  let timezoneHTML = document.getElementById("timezone")

  let latitudeVar = data["latitude"];
  let latitudeHTML = document.getElementById("latitude")

  let longitudeVar = data["longitude"];
  let longitudeHTML = document.getElementById("longitude")

  let elevationVar = data["elevation"];
  let elevationHTML = document.getElementById("elevation")

  timezoneHTML.textContent = timezoneVar
  latitudeHTML.textContent = latitudeVar
  longitudeHTML.textContent = longitudeVar
  elevationHTML.textContent = elevationVar
  console.log(data);

  plot(data);

}
let cargarOpenMeteo = () => {

  //URL que responde con la respuesta a cargar
  let URL = 'https://api.open-meteo.com/v1/forecast?latitude=-2.1962&longitude=-79.8862&hourly=temperature_2m&timezone=auto';

  fetch(URL)
    .then(responseText => responseText.json())
    .then(responseJSON => {

      console.log(responseJSON);
      //Respuesta en formato JSON
      //Referencia al elemento con el identificador plot
      let plotRef = document.getElementById('plot1');

      //Etiquetas del gráfico
      let labels = responseJSON.hourly.time;

      //Etiquetas de los datos
      let data = responseJSON.hourly.temperature_2m;

      //Objeto de configuración del gráfico
      let config = {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Temperatura [2m]',
              data: data,
            }
          ]
        }
      };

      //Objeto con la instanciación del gráfico
      let chart1 = new Chart(plotRef, config);


    })
    .catch(console.error);

}

let parseXML = (responseText) => {

  // Parsing XML
  const parser = new DOMParser();
  const xml = parser.parseFromString(responseText, "application/xml");

  // Referencia al elemento `#forecastbody` del documento HTML

  let forecastElement = document.querySelector("#forecastbody")
  forecastElement.innerHTML = ''

  // Procesamiento de los elementos con etiqueta `<time>` del objeto xml
  let timeArr = xml.querySelectorAll("time")

  timeArr.forEach(time => {

    let from = time.getAttribute("from").replace("T", " ")

    let humidity = time.querySelector("humidity").getAttribute("value")
    let windSpeed = time.querySelector("windSpeed").getAttribute("mps")
    let precipitation = time.querySelector("precipitation").getAttribute("probability")
    let pressure = time.querySelector("pressure").getAttribute("value")
    let cloud = time.querySelector("clouds").getAttribute("all")

    let template = `
          <tr>
              <td>${from}</td>
              <td>${humidity}</td>
              <td>${windSpeed}</td>
              <td>${precipitation}</td>
              <td>${pressure}</td>
              <td>${cloud}</td>
          </tr>
      `

    //Renderizando la plantilla en el elemento HTML
    forecastElement.innerHTML += template;
  })

}

// Callback async
let selectListener = async (event) => {

  let selectedCity = event.target.value

  //Lea la entrada de almacenamiento local
  let cityStorage = localStorage.getItem(selectedCity);

  if (cityStorage == null) {


    try {

      //API key
      let APIkey = '3cd5a7ee8564cb6a66f6d4446f8b465b'
      let url = `https://api.openweathermap.org/data/2.5/forecast?q=${selectedCity}&mode=xml&appid=${APIkey}`

      let response = await fetch(url)
      let responseText = await response.text()

      await parseXML(responseText)
      // Guarde la entrada de almacenamiento local
      await localStorage.setItem(selectedCity, responseText)


    } catch (error) {
      console.log(error)
    }

  } else {
    // Procese un valor previo
    parseXML(cityStorage)
  }
}

let loadForecastByCity = () => {

  //Handling event
  let selectElement = document.querySelector("select")
  selectElement.addEventListener("change", selectListener)

}

let loadExternalTable = async () => {
  //Requerimiento asíncrono
  let url = "https://www.gestionderiesgos.gob.ec/monitoreo-de-inundaciones/";

  //cors proxy
  let proxyURL = "https://cors-anywhere.herokuapp.com/";
  let endpoint = proxyURL + url;

  let response = await fetch(endpoint);
  let responseText = await response.text();

  const parser = new DOMParser();
  const xml = parser.parseFromString(responseText, "text/html");

  console.log("que mirah bobo" + xml);

  let elementoXML = xml.querySelector("#postcontent table");
  let elementoDOM = document.getElementById("monitoreo");

  elementoDOM.innerHTML = elementoXML.outerHTML;
}

let loadInocar = () => {
  let URL_proxy = 'https://cors-anywhere.herokuapp.com/';
  let URL = URL_proxy + 'https://www.inocar.mil.ec/mareas/consultan.php';
  fetch(URL)
    .then(response => response.text())
    .then(data => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, 'text/html');
      let contenedorHTML = document.getElementById('table-container');
      
      let rowElements = xmlDoc.getElementsByClassName('row');
      let filteredRows = [rowElements[0], rowElements[1]];  // Filtrar los primeros dos elementos row
      
      let filteredHTML = Array.from(filteredRows)
        .map(row => row.outerHTML)
        .join('');

      contenedorHTML.innerHTML = filteredHTML;
    })
    .catch(console.error);
};

  (
    function () {
       

        let meteo = localStorage.getItem('meteo');

        if(meteo==null){
          let URL = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m";

          fetch( URL )
          .then(response => response.json())
          .then(data => {
           
            load(data)

            localStorage.setItem("meteo", JSON.stringify(data))
          })
          .catch(console.error);


        }else{

          load(JSON.parse(meteo))
          
        }

        loadInocar();

    }
  )();

cargarOpenMeteo()
loadForecastByCity()
loadExternalTable()





