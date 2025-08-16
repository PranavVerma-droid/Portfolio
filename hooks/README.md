# PocketBase Contact Form Hook

This PocketBase hook automatically sends email notifications when a contact form is submitted through the portfolio website.

## Features

- Sends a confirmation email to the user who submitted the form
- Sends a notification email to the admin
- Handles form submissions from the 'forms' collection
- Includes all form data in the email notifications

## Setup Instructions

### 1. Create a Symlink

To use this hook with your PocketBase instance, you need to create a symlink in your PocketBase hooks directory:

```bash
# Navigate to your PocketBase installation directory
cd /path/to/your/pocketbase

# Create the pb_hooks directory if it doesn't exist
mkdir -p pb_hooks

# Create a symlink to the contact hook
ln -s /home/pranavverma/Github/Websites/Portfolio/hooks/contact.pb.js pb_hooks/contact.pb.js
```

### 2. Configure Email Settings

Make sure your PocketBase instance has email settings configured:

1. Open PocketBase Admin UI
2. Go to Settings → Mail settings
3. Configure your SMTP settings
4. Set the sender address (or it will default to `pranavverma233@gmail.com`)

### 3. Database Collection

Ensure you have a collection named `forms` with the following fields:
- `name` (text)
- `email` (email)
- `phone` (text, optional)
- `company` (text, optional)
- `message` (text)

## How it Works

1. When a new record is created in the 'forms' collection, the hook triggers
2. Two emails are sent:
   - **User Email**: Confirmation email to the person who submitted the form
   - **Admin Email**: Notification email to `pranav@verma.net.in`

## Email Templates

### User Confirmation Email
- Uses JetBrains Mono font for consistent branding
- Includes all submitted form data
- Thanks the user and informs them to expect a reply

### Admin Notification Email
- Simple notification format
- Includes customer details and message ID
- Prompts admin to check sent emails for replies

## File Structure

```
hooks/
├── contact.pb.js    # Main hook file
└── README.md        # This documentation
```

## Troubleshooting

- Check PocketBase logs if emails aren't being sent
- Verify SMTP settings in PocketBase admin
- Ensure the 'forms' collection exists with correct field names
- Check that the symlink was created correctly: `ls -la pb_hooks/`

## Notes

- The hook only processes records from the 'forms' collection
- Email sending errors are logged but don't prevent the record creation
- Admin emails are sent to `pranav@verma.net.in`
- Default sender is `pranavverma233@gmail.com` if not configured