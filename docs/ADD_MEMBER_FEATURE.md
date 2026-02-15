# Add Member Feature

## Overview

You can now add members to existing groups! This feature allows any group member to invite other users to join their expense groups.

## How to Use

### Step 1: Select a Group
- Click on any group in the sidebar to view it

### Step 2: Click "Add Member" Button
- In the group dashboard, you'll see an "Add Member" button next to "Manage Categories"
- Click this button to open the add member dialog

### Step 3: Enter Email Address
- Enter the email address of the person you want to add
- **Important**: The person must have signed into the app at least once before you can add them

### Step 4: Add Member
- Click "Add Member" to send the invitation
- If successful, the person will immediately become a member of the group
- The member list will refresh automatically

## Features

- **Email-based invites**: Add users by their email address
- **Validation**: Checks if the user exists and isn't already a member
- **Access control**: Only group members can add new members
- **Real-time updates**: Member list refreshes automatically after adding

## Error Messages

You might see these error messages:

- **"User not found. They need to sign in first."** - The person hasn't created an account yet
- **"User is already a member of this group"** - This person is already in the group
- **"Not a member of this group"** - You need to be a group member to add others
- **"Email is required"** - You forgot to enter an email address

## Technical Details

### API Endpoint
```
POST /api/groups/[groupId]/members
Body: { email: "user@example.com" }
```

### Database
- Adds a record to the `group_members` table
- Links the user to the group with a timestamp

### Components Added
- `components/add-member-modal.tsx` - The UI modal for adding members
- Updated `components/dashboard.tsx` - Added the "Add Member" button
- Updated `app/api/groups/[groupId]/members/route.ts` - Added POST endpoint

## Future Enhancements

Consider these improvements:
- Email notifications when someone is added to a group
- Ability to remove members from groups
- Role-based permissions (admin vs member)
- Invite links that work even if the user hasn't signed up yet
- Search/autocomplete for users by name or email
