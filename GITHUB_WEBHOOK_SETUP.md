# GitHub Webhook Setup for Real-Time Commit Syncing

This guide explains how to set up automatic syncing when you push commits to GitHub.

## How It Works

The app now listens to Firebase Realtime Database for webhook triggers at:
```
users/{userId}/githubWebhook/trigger
```

When this value is set to `true`, the app automatically syncs your GitHub commits.

## Setup Options

### Option 1: GitHub Actions (Recommended)

Create `.github/workflows/commit-sync.yml` in any of your repositories:

```yaml
name: Sync Commits to Commitly

on:
  push:
    branches: ['*']  # Trigger on all branches

jobs:
  notify-commitly:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Commitly Sync
        run: |
          curl -X PATCH \
            "https://commitly-38c81-default-rtdb.firebaseio.com/users/${{ secrets.COMMITLY_USER_ID }}/githubWebhook/trigger.json" \
            -H "Content-Type: application/json" \
            -d 'true'
```

**Setup:**
1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add a new secret:
   - Name: `COMMITLY_USER_ID`
   - Value: Your Firebase user ID (found in app after login)

### Option 2: GitHub Webhook + Cloud Function

1. **Create a Firebase Cloud Function:**

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.githubWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const event = req.headers['x-github-event'];
  const payload = req.body;

  // Only process push events
  if (event === 'push') {
    const username = payload.sender?.login;
    
    if (username) {
      // Find user by GitHub username
      const usersSnapshot = await admin.database()
        .ref('users')
        .orderByChild('github/username')
        .equalTo(username)
        .once('value');

      const users = usersSnapshot.val();
      if (users) {
        // Trigger sync for all matching users
        const updates = {};
        Object.keys(users).forEach(uid => {
          updates[`users/${uid}/githubWebhook/trigger`] = true;
        });
        
        await admin.database().ref().update(updates);
        console.log(`Triggered sync for ${username}`);
      }
    }
  }

  res.status(200).send('OK');
});
```

2. **Deploy the function:**
```bash
firebase deploy --only functions
```

3. **Configure GitHub Webhook:**
   - Go to your GitHub repository → Settings → Webhooks → Add webhook
   - Payload URL: `https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/githubWebhook`
   - Content type: `application/json`
   - Events: Select "Just the push event"
   - Save

### Option 3: Manual Trigger (Testing)

For testing, manually trigger sync via Firebase Console or REST API:

**Using Firebase Console:**
1. Go to Firebase Console → Realtime Database
2. Navigate to `users/{your-uid}/githubWebhook/trigger`
3. Set value to `true`
4. Watch app auto-sync!

**Using REST API:**
```bash
curl -X PATCH \
  "https://commitly-38c81-default-rtdb.firebaseio.com/users/YOUR_USER_ID/githubWebhook/trigger.json" \
  -H "Content-Type: application/json" \
  -d 'true'
```

## How to Get Your User ID

1. Open the Commitly app
2. Go to Settings screen
3. Check the console logs (in development) or add a UI element to display it
4. Or check Firebase Console → Authentication → Users

## Testing

1. Make a commit and push to GitHub
2. Check Firebase Realtime Database - you should see:
   - `users/{uid}/githubWebhook/trigger` set to `true` briefly
   - Then reset to `false` after sync completes
3. Open the app - your new commit should appear automatically!

## Pull-to-Refresh

Don't want to wait for webhooks? The History screen now supports pull-to-refresh:
- Pull down on the commit list to manually refresh
- Works even without GitHub webhooks configured

## Troubleshooting

**Commits not syncing?**
- Check that GitHub token is valid (re-authenticate in Settings)
- Verify webhook trigger is being set in Firebase
- Check app console logs for sync errors
- Try manual "Sync Now" button in Settings

**Old commits missing?**
- The app looks back 48 hours by default
- For older commits, use "Sync Now" in Settings (fetches last 100 commits)

**Webhook not firing?**
- Verify webhook URL is correct
- Check GitHub webhook delivery logs (Settings → Webhooks → Recent Deliveries)
- Ensure Firebase Realtime Database security rules allow writes to webhook path
