// authenticate myself for Mailjet. Put this in the .env folders once everything is set
// export MJ_APIKEY_PUBLIC='5c0d15bd4bd31ce23181131a4714e8e1';
// export MJ_APIKEY_PRIVATE='dcc70eeccd3807c5f055808b8e3261ad';

// export MJ_API_TOKEN='your API token';

import { Client, LibraryResponse, SendEmailV3_1 } from 'node-mailjet';

export class TwoFactorBE {
    private secretCode: number; // might be string 
    private mailjet: Client;

    constructor(){
        this.secretCode = Math.floor(Math.random() * (999999 + 1) + 0);
        this.mailjet = new Client({
            //replace these in .env and destroy when shipping production code.
            apiKey: process.env.EXPO_PUBLIC_MJ_API_KEY,
            apiSecret: process.env.EXPO_PUBLIC_MJ_API_SECRET

        })
    }

    public compareOTP(OTP: number): boolean {// might be superflous but this is called when user enters the code to allow the backend top handle 
        return this.secretCode == OTP;
    }

    public async sendEmailWithCode(userEmail: string, rn: string){
        //send the email with the code. We'll need to find out if SDSC cloud servers can send emails.
        //implement Mailjet API if we have to use outside API to send email
        
        const data: SendEmailV3_1.Body = {
            Messages: [
                {
                    From: {
                        Email: "tylervo.2002@gmail.com", //replace with our own created domain or something other than my email account if we have one.
                        Name: "Cramr Team" 
                    },
                    To: [
                        {
                            Email: userEmail,
                            Name: rn
                        },
                    ],
                    Subject: "Your One Time Passcode",
                    TextPart: `Hello ${rn},\n\nYou have tried to log in and your One Time Passcode is ${this.secretCode}. If you did not request a One Time Password, please change your password as soon as possible.\n\nThank you,\nThe Cramr Team`
                }
            ]
        }
        const result: LibraryResponse<SendEmailV3_1.Response> = await this.mailjet
            .post('send', { version: 'v3.1' })
            .request(data);
        
        const { Status } = result.body.Messages[0];
    }
}