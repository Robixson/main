document.addEventListener('DOMContentLoaded', function() {

  // ŻĄDANIE ZGODY NA POWIADOMIENIA 
  if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
          if (permission !== "granted") {
              console.warn("Brak zgody na powiadomienia, nie będą wyświetlane po ułożeniu. Sprawdź ustawienia przeglądarki.");
          }
      });
  }
  var geo = navigator.geolocation;

  // Inicjalizacja mapy 
  var map = L.map('mapa').setView([52.2297, 21.0122], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Przycisk "Moja lokalizacja" 
  if (geo) {
    document.getElementById('Locate').addEventListener('click', function() {
      geo.getCurrentPosition(function(location) {
        var lat = location.coords.latitude;
        var lng = location.coords.longitude;
        map.setView([lat, lng], 15);
        L.marker([lat, lng]).addTo(map)
          .bindPopup("Twoja aktualna lokalizacja")
          .openPopup();
      }, function(error) {
        alert("Nie mozna pobrac lokalizacji: " + error.message);
      });
    });
  }

  // Przycisk "Pobierz Mapę" 
  document.getElementById('Pobierz').addEventListener('click', function() {
    var wektorDiv = document.getElementById('wektor');
    var puzzleDiv = document.getElementById('puzzle');
    var stolDiv = document.getElementById('stol');

    // Wyczyść wszystkie pola 
    wektorDiv.innerHTML = "<p style='text-align:center;'>Generowanie obrazu mapy...</p>";
    puzzleDiv.innerHTML = "";
    stolDiv.innerHTML = "";

    leafletImage(map, function(err, canvas) {
      if (err) {
        console.error("Blad podczas generowania obrazu:", err);
        wektorDiv.innerHTML = "<p style='color:red;'>Nie udalo sie wygenerowac mapy.</p>";
        return;
      }

      var img = new Image();
      img.src = canvas.toDataURL("image/png");
      img.style.width = "100%";

      wektorDiv.innerHTML = "";
      wektorDiv.appendChild(img);

      img.onload = function() {
        podzielNaPuzzle(img, 4, 4);
      };
    });
  });

  // Umożliwienie przenoszenia puzzli z powrotem do puli
  var puzzleDiv = document.getElementById('puzzle');
  puzzleDiv.addEventListener('dragover', onDragOver);
  puzzleDiv.addEventListener('drop', onDropToPuzzleArea);

  //  Funkcja dzielenia na puzzle

  function podzielNaPuzzle(img, wiersze, kolumny) {
    var puzzleDiv = document.getElementById('puzzle');
    var stolDiv = document.getElementById('stol');
    var szer = img.width;
    var wys = img.height;
    var szerCz = szer / kolumny;
    var wysCz = wys / wiersze;

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = szerCz;
    canvas.height = wysCz;

    var kawalki = [];
    var sloty = []; 

    for (var y = 0; y < wiersze; y++) {
      for (var x = 0; x < kolumny; x++) {
        var poprawnyIndex = y * kolumny + x;
        var idKawalka = "piece_" + poprawnyIndex;
        
        ctx.clearRect(0, 0, szerCz, wysCz);
        ctx.drawImage(img, x * szerCz, y * wysCz, szerCz, wysCz, 0, 0, szerCz, wysCz);

        var fragment = new Image();
        fragment.src = canvas.toDataURL("image/png");
        fragment.style.border = "1px solid black"; 
        fragment.style.margin = "2px";
        fragment.style.width = (500 / kolumny - 3) + "px";
        fragment.style.height = (500 / wiersze - 3) + "px";
        fragment.classList.add('puzzle-piece'); 
        fragment.draggable = true;
        fragment.id = idKawalka;
        fragment.addEventListener("dragstart", onDragStart);

        kawalki.push(fragment);
        
        // Utwórz SLOT 
        var slot = document.createElement('div');
        slot.classList.add('puzzle-slot');
        slot.style.width = (500 / kolumny - 1) + "px"; 
        slot.style.height = (500 / wiersze - 1) + "px";
        slot.style.margin = "0";
        slot.dataset.correctId = idKawalka;
        slot.addEventListener('dragover', onDragOver);
        slot.addEventListener('drop', onDropToSlot); 
        sloty.push(slot);
      }
    }

    // Ustawienie stołu (slotów)
    stolDiv.innerHTML = "";
    stolDiv.style.display = "grid";
    stolDiv.style.gridTemplateColumns = `repeat(${kolumny}, 1fr)`;
    sloty.forEach(s => stolDiv.appendChild(s));
    
    // Wymieszanie i umieszczenie puzzli w puli
    for (let i = kawalki.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [kawalki[i], kawalki[j]] = [kawalki[j], kawalki[i]];
    }

    puzzleDiv.style.display = "grid";
    puzzleDiv.style.gridTemplateColumns = `repeat(${kolumny}, 1fr)`;
    kawalki.forEach(k => puzzleDiv.appendChild(k));
  }

  // Obsługa przeciągania puzzli 

  function onDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
  }

  function onDragOver(e) {
    e.preventDefault(); 
  }

  function onDropToPuzzleArea(e) {
      e.preventDefault();
      const idKawalka = e.dataTransfer.getData("text/plain");
      const kawalek = document.getElementById(idKawalka);
      
      if (kawalek) {
          kawalek.style.margin = "2px";
          kawalek.style.border = "1px solid black";
          kawalek.classList.remove('correct', 'incorrect');
          puzzleDiv.appendChild(kawalek);
      }
  }

  function onDropToSlot(e) {
    e.preventDefault();
    const idKawalka = e.dataTransfer.getData("text/plain");
    const kawalek = document.getElementById(idKawalka);
    const slotDocelowy = e.currentTarget; 

    if (kawalek && slotDocelowy) {
        if (slotDocelowy.children.length === 0) {
            slotDocelowy.appendChild(kawalek);
            kawalek.style.margin = "0"; 
            kawalek.style.border = "none"; 
            sprawdzPojedynczyElement(kawalek, slotDocelowy);
            sprawdzRozwiazanie();
        
        } else {
            console.log("Slot zajęty. Przenoszę upuszczany element z powrotem do puli.");
            onDropToPuzzleArea({ preventDefault: () => {}, dataTransfer: { getData: () => idKawalka } });
        }
    }
  }

  // Weryfikacja pojedynczego elementu
  function sprawdzPojedynczyElement(kawalek, slot) {
    kawalek.classList.remove('correct', 'incorrect');
    
    if (kawalek.id === slot.dataset.correctId) {
        kawalek.classList.add('correct');
    } else {
        kawalek.classList.add('incorrect');
    }
  }

  function sprawdzRozwiazanie() {
    const sloty = document.querySelectorAll('#stol .puzzle-slot');
    let poprawnieUlozone = 0;
    
    sloty.forEach(slot => {
      if (slot.children.length > 0) {
        const idKawalka = slot.children[0].id;
        const idPoprawny = slot.dataset.correctId;
        
        if (idKawalka === idPoprawny) {
          poprawnieUlozone++;
        }
      }
    });
    
    if (poprawnieUlozone === sloty.length && sloty.length === 16) {
      console.log("Udało Ci się ułożyć mapę!")
      if (Notification.permission === "granted") {
        new Notification("GRATULACJE! 🎉", {
          body: "Udało Ci się ułożyć mapę!",
        });
      } else {
        console.warn("Brak zgody na powiadomienia, nie można wyświetlić.");
      }
    }
  }

});