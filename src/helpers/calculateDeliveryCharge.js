
const NodeGeocoder = require('node-geocoder');
const geolib = require('geolib');

const options = {
    provider: 'openstreetmap',
    language: 'en',
    region: 'in',
}

const geoCoder = NodeGeocoder(options);


async function getCordinates(sourcePincode, destinationPincode) {
    try {
        let [sourceLocation, destinationLocation] = await Promise.all([
            geoCoder.geocode(sourcePincode),
            geoCoder.geocode(destinationPincode),
        ]);
        console.log('source', sourceLocation, 'destination', destinationLocation)

        destinationLocation = destinationLocation.filter(location => {
            return location.countryCode === 'IN';
        });
        sourceLocation = sourceLocation.filter(location => {
            return location.countryCode === 'IN';
        });
        

        return [sourceLocation, destinationLocation];


    } catch (error) {
        console.log(error)

    }

}

function getDistance(sourceLocation, destinationLocation) {
    
        const sourceCordinates = [sourceLocation[0].latitude, sourceLocation[0].longitude];
        const destinationCordinates = [destinationLocation[0].latitude, destinationLocation[0].longitude];

    const [sourceLat, sourceLong] = sourceCordinates;
    const [destLat, destLong] = destinationCordinates;

       const R = 6471 // radius of the Earth in Km
       const diffLat = deg2rad(sourceLat - destLat);
       const diffLong = deg2rad(sourceLong - destLong);

       const v =
       Math.sin(diffLat / 2) * Math.sin(diffLat / 2) + Math.cos(deg2rad(sourceLat)) * Math.cos(deg2rad(destLat)) * Math.sin(diffLong / 2) * Math.sin(diffLong/2);
        const w = 2 * Math.atan(Math.sqrt(v), Math.sqrt( 1 - v) );
        return R * w;
    // return geolib.getPreciseDistance(
    //     { latitude: sourceLat, longitude: sourceLong },
    //     { latitude: destLat, longitude: destLong }
    //     )

}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function calculateDeliveryCharge(distance) {
    let charge;
    
    if( distance <= 10 ) return 0
    else if( distance > 10 && distance < 20) {  
         charge = Math.ceil(distance * 0.4);
         return (Math.trunc(charge/ 10) +1) * 10
            
    }else if( distance >= 20 && distance <= 30) {
        charge = Math.ceil(distance * 0.5)
        return (Math.trunc(charge/ 10) +1) * 10
    }else{
        charge = Math.ceil(distance * 0.6)
        return (Math.trunc(charge/ 10) +1) * 10
    }
    
}

module.exports = {
    getDistance,
    calculateDeliveryCharge,
    getCordinates
}