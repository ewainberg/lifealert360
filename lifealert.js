const EARTH_RADIUS_MILES = 3961; //earth's radius for haversine formula
const life360 = require('life360-node-api') //get api module

if(process.argv.length == 2){ //if circle name not passed as argument, set to default Family
	circleName = 'Family';
}
else{ //if circle name passed, set as global variable
	global.circleName = process.argv[2];
}

async function main() {
  client = await life360.login('yourUser', 'yourPassword') //log in to life360 with username and password
  //declare variables for circles, members, and constant names, IDs, etc...
  let circles = await client.listCircles()
  let myCircle = circles.findByName(circleName)
  let members = await myCircle.listMembers()
  const selfID = client.session.user.id
  const selfFirst = client.session.user.firstName
  const selfLast = client.session.user.lastName
  const firstLast = selfFirst + ' ' + selfLast

//based on two sets of coordinates, using the haversine formula checks if these points are distanceMiles from each other. if they are, return true.
  function withinDistance(myLat, myLng, otherLat, otherLng, distanceMiles) {
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    myLat = toRadians(myLat);
    myLng = toRadians(myLng);
    otherLat = toRadians(otherLat);
    otherLng = toRadians(otherLng);

    const dLat = otherLat - myLat;
    const dLng = otherLng - myLng;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(myLat) * Math.cos(otherLat) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = EARTH_RADIUS_MILES * c;

    return distance <= distanceMiles;
  }
  
  //declare variables for self 
    selfLat = members.findByName(firstLast).location.latitude 
    selfLong = members.findByName(firstLast).location.longitude
    console.log(firstLast + ': ' + selfLat + ', ' + selfLong + '\n(self)\n')
	
//loop through members of member array and print out their name, coordinates, and whether they are within the distance which withinDistance is called with
  for (const member of members) {
    if(selfID != member.id){
	  console.log(`${member.firstName} ${member.lastName}` + ': ' + member.location.latitude + ', ' + member.location.longitude)
      console.log(withinDistance(selfLat, selfLong, member.location.latitude, member.location.longitude, 1))
    } 
  }
}

//calls main, an asynchronous function necessary for the await commands
main();
