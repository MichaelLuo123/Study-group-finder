import { Client } from "@googlemaps/google-maps-services-js";

class PublicStudySession extends StudySession{
    private attendance: Array<User>;
    private client;

    constructor(location: string, time: Date, subject: string){
        super(location, time, subject);
        this.attendance = [];
        this.client = new Client({});
    }

    // Add logic here, most likely with Google Maps API.
    // It can be viewed by everyone, BUT it can only be held in public spaces.

    // turning address to coordinates so that it can be displayed in frontend (although we might store the location as an array instead for security purposes)
    //returns a google LatLng object, which works well with front end map. Change after 
    public async addressToCoordinates(location: string){
        try {
            const response = await this.client.geocode({
                params : {
                    address: location,
                    key: process.env.MAPS_API_KEY, //we're gonna use environment variables for the API Key. I will provide it once I'm ready to deploy.
                },
                timeout: 1000 //might be shorter given the constraints of the project.
            });
            return response.data;
        } catch (error) {
            console.error("Error decoding address:" , error);
            throw new Error("Failed to decode address");
        }
    }

}