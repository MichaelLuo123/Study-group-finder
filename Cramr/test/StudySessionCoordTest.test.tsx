import { beforeAll, describe, expect, test } from '@jest/globals';
import { PublicStudySession } from '../Logic/PublicStudySession';


var testStudySession: PublicStudySession;

beforeAll(() => {
    testStudySession = new PublicStudySession("Calhoun Mill Rd, Calhoun Falls, SC 29628", new Date(), "Math");
});

describe('testing to see if the geocoding functionality actually works', () => {
    test('converting the address to coordinates', async () => {
        //create LatLng object for testing
        // var testCord = [34.04475, -82.526375];
        //We're using SDSC as our guide
        const pulledCord = testStudySession.addressToCoordinates("9836 Hopkins Dr, La Jolla, CA 92093"); //will edit so that it calls from private variable in Public Study Session
        expect(JSON.stringify((await pulledCord).geometry.location.lat)+JSON.stringify((await pulledCord).geometry.location.lng)).toBe("32.88439,-117.239172");
    });
});