import { PrivateStudySession } from "./PrivateStudySession";
import { StudySessionFactory } from "./StudySessionFactory";

export class PublicStudySessionFactory extends StudySessionFactory{
    public override createStudySession(location:string, time: Date, subject: string){
        //tell frontend to display this study session to nearby users
        return new PrivateStudySession(location, time, subject);
    }

    
}