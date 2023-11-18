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





