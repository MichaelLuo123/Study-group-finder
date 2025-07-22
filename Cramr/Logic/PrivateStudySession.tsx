import { StudySession } from "./StudySession";
import { User } from "./User";

export class PrivateStudySession extends StudySession{
    private attendance: Array<User>;

    constructor(location: string, time: Date, subject: string){
        super(location, time, subject);
        this.attendance = [];
    }

    // Add logic here, most likely with Google Maps API.
    // Most likely, it will allow home addresses to be placed in location in the constructor
    

}