const express = require('express');
const app = express();

const EARTH_RADIUS_MILES = 3961;
const life360 = require('life360-node-api');

global.distance = 0;

if (process.argv.length == 2) {
  circleName = 'Ram Assassin 2023';
} else {
  global.circleName = process.argv[2];
}

async function main() {
  client = await life360.login('ewainberg17@gmail.com', 'Pretzel123!');
  let circles = await client.listCircles();
  let myCircle = circles.findByName(circleName);
  let members = await myCircle.listMembers();
  const selfID = client.session.user.id;
  const selfFirst = client.session.user.firstName;
  const selfLast = client.session.user.lastName;
  const firstLast = selfFirst + ' ' + selfLast;

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
    distance = EARTH_RADIUS_MILES * c;
	
    return distance <= distanceMiles;
  }

  selfLat = members.findByName(firstLast).location.latitude;
  selfLong = members.findByName(firstLast).location.longitude;

  const closeMembers = [];

  for (const member of members) {
    if (selfID != member.id && member.location !== null) {
      if (!(withinDistance(selfLat, selfLong, member.location.latitude, member.location.longitude, 1))) {
        closeMembers.push(member);
      }
    }
  }
    sendInfo = "";
	closeMembers.forEach(member => {
		sendInfo += (member.firstName + ' ' + member.lastName + ' is '  + (Math.round(distance * 100) / 100) + ' miles away.' +"<br/>");
	});
	
  app.get('/close-members', (req, res) => {
		res.send(sendInfo);
  });

  app.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
}

main();