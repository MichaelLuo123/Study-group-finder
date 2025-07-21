class PublicStudySession extends StudySession{
    private attendance: Array<User>;

    constructor(location: string, time: Date, subject: string){
        super(location, time, subject);
        this.attendance = [];
    }

    // Add logic here, most likely with Google Maps API.
    // It can be viewed by everyone, BUT it can only be held in public spaces.

}