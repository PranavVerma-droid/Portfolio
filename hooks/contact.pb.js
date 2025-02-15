/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
    if (e.collection.name !== 'forms') {
        return e.next();
    }

    try {
        console.log("Form submitted, attempting to send emails...");

        // Create email messages
        const userMessage = {
            from: {
                address: e.app.settings().meta.senderAddress || "pranavverma233@gmail.com",
                name: "Pranav's Portfolio"
            },
            to: [{
                address: e.record.get('email')
            }],
            subject: "Thank you for contacting Pranav Verma",
            html: `
                <style>@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap');</style>
                <h1 style="font-family: 'JetBrains Mono', monospace;">Hey! This is an Automated Email sent by Pranav Verma's Portfolio.</h1>
                <p style="font-family: 'JetBrains Mono', monospace;">
                    <br>It appears that you have filled the contact form in my portfolio - https://www.pranavv.co.in
                    <br>Please wait, as Pranav Verma will be with you shortly in the reply section of this email.
                    <br><br><hr>
                    <b>You have sent this Message in the Contact Form of the Website:</b><br>
                    <b>Name:</b> ${e.record.get('name')}<br><br>
                    <b>Email:</b> ${e.record.get('email')}<br><br>
                    <b>Phone Number:</b> ${e.record.get('phone') || 'Not provided'}<br><br>
                    <b>Company:</b> ${e.record.get('company') || 'Not provided'}<br><br>
                    <b>Message:</b><br>${e.record.get('message')}<br><hr><br>
                    Please Wait for the owner to reply to this email. In the meanwhile, please reply to add anything that you missed.
                    <br><br>Thanks!
                </p>`
        };

        const adminMessage = {
            from: {
                address: e.app.settings().meta.senderAddress || "pranavverma233@gmail.com",
                name: "Portfolio Contact Form"
            },
            to: [{
                address: "pranav@verma.net.in"
            }],
            subject: "New Contact Form Submission",
            html: `
                <b>There was just a New Contact Form on the Website!<br>
                Please Check your Sent Emails to Reply to the Customer!</b><br><br>
                Customer Email: <b>${e.record.get('email')}</b><br>
                Customer Name: <b>${e.record.get('name')}</b><br>
                Customer Message ID: <b>${e.record.id}</b><br>
                Customer Phone Number: <b>${e.record.get('phone') || 'Not provided'}</b><br>
                Customer Company: <b>${e.record.get('company') || 'Not provided'}</b><br><br>
                Customer Message:<br>${e.record.get('message')}`
        };

        // Send the emails using the app instance from the event
        e.app.newMailClient().send(userMessage);
        console.log("User email sent successfully");
        
        e.app.newMailClient().send(adminMessage);
        console.log("Admin email sent successfully");

    } catch (error) {
        console.error("Failed to send emails:", error);
    }

    return e.next();
}, "forms");
