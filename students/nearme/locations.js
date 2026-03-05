const locations = [
    { name: "Great Valley High School", address: "225 Phoenixville Pike, Malvern, PA 19355" },
    { name: "Conestoga High School", address: "200 Irish Rd, Berwyn, PA 19312" },
    { name: "Blast Robotics", address: "15 Waterloo Ave, Berwyn, PA 19312" }
];

let map, markers = [];

async function geocodeAddress(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url, {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'MyMapApp/1.0' }
    });
    const data = await res.json();
    if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
}

async function initMap() {
    map = L.map('map').setView([40.7128, -74.0060], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    
    for (const loc of locations) {
        const coords = await geocodeAddress(loc.address);
        if (coords) {
            loc.lat = coords.lat;
            loc.lng = coords.lng;
        }
    }

    displayLocations(locations);
}

function displayLocations(locs) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    const list = document.getElementById('locationsList');
    list.innerHTML = '';

    locs.forEach((loc) => {
        if (!loc.lat || !loc.lng) return; 

        const marker = L.marker([loc.lat, loc.lng])
            .bindPopup(`<b>${loc.name}</b><br>${loc.address}`)
            .addTo(map);
        markers.push(marker);

        const div = document.createElement('div');
        div.className = 'location-item';
        div.innerHTML = `<h4>${loc.name}</h4><p>${loc.address}</p>`;
        div.onclick = () => {
            map.setView([loc.lat, loc.lng], 15);
            marker.openPopup();
        };
        list.appendChild(div);
    });
}

document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = locations.filter(loc =>
        loc.name.toLowerCase().includes(query) ||
        loc.address.toLowerCase().includes(query)
    );
    displayLocations(filtered);
});

document.addEventListener('DOMContentLoaded', initMap);