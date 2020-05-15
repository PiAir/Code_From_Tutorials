
const auth_link = "https://www.strava.com/oauth/token"

function getActivites(res){

    // console.log(res)
    const activities_link = `https://www.strava.com/api/v3/athlete/activities?per_page=60&access_token=${res.access_token}`
    fetch(activities_link)
        .then((res) => res.json())
        .then(function (data){
        
            var map = L.map('map').setView([51.45668031498194, 5.774687314453169], 11);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            var myHeaders = new Headers();
            myHeaders.append("Authorization", "Bearer " + res.access_token);

            
            var requestOptions = {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            };
            
            var latlngbounds = new L.latLngBounds(); // contains boundaries of the lines
            
            for(var x=0; x<data.length; x++){
                console.log("X = " + x + " ID = " + data[x].id);
                // only map walks
                if (data[x].type == "Walk") {
                    console.log("Walking")
                    fetch("https://www.strava.com/api/v3/activities/"+data[x].id+"?include_all_efforts=true", requestOptions)
                        .then((res) => res.json())
                        .then(function (data){
                            // some walks don't have gps info because they were added manually
                            try {
                                var polyline = L.Polyline.fromEncoded(data.map.polyline);
                                latlngbounds.extend(polyline.getBounds()); // store boundary info
                                var coordinates = L.Polyline.fromEncoded(data.map.polyline).getLatLngs();
                                L.polyline(
                                    coordinates,
                                    {
                                        color: "#" + Math.floor(Math.random()*16777215).toString(16),
                                        weight:5,
                                        opacity:.7,
                                        lineJoin:'round'
                                    }
                                ).addTo(map)
                                map.fitBounds(latlngbounds); // set boundary
                            }  catch(err) {
                                console.log("Cannot read map for activity " + x + " = " + data.name + " ID = " + data.id);
                            }
                        })
                        .catch(error => console.log('error', error));

                }

            }
          
        })
}

    
function reAuthorize() {
    fetch(auth_link, {
        method: 'post',

        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({

            client_id: 'xxxx',
            client_secret: 'xxxxxxx',
            refresh_token: 'xxxxxxx',
            grant_type: 'refresh_token'

        })

    }).then(res => res.json())
        .then(res => getActivites(res))
}

reAuthorize()