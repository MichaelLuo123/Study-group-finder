
class PublicStudySession extends StudySession{
    private attendance: Array<User>;

    constructor(location: string, time: Date, subject: string){
        super(location, time, subject);
        this.attendance = [];
    }

    // Add logic here, most likely with Google Maps API.
    // It can be viewed by everyone, BUT it can only be held in public spaces.

    // turning address to coordinates so that it can be displayed in frontend (although we might store the location as an array instead for security purposes)
    //returns a google LatLng object, which works well with front end map
    public addressToCoordinates(location: string){
        var geocoder = new google.maps.Geocoder(); //might be inefficient because we're calling Google Maps API for everytime we're converting to coordinates
        geocoder.geocode( { 'address': location}, function(results, status){
            if(status == 'OK'){
                return results[0].geometry.location; 
            }
        });
        return [-1, -1]
    }

}