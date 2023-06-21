# Tauri udate server

---

This updater is built for use in updating Tauri applications hosted on private github repos but can also be used to update those hosted in public repos.

## env variables

| ENV VARIABLE | DESCRIPTION                                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| API_KEY      | For authentication <br> Should be same as the one provided as the `api_key` query param in updater url in your tauri config |
| GITHUB_TOKEN | Your github access token <br> **Ensure to replace the access token in the env variables when it expires**                   |
| OWNER        | Github username                                                                                                             |
| REPO         | Github repo name                                                                                                            |
| NODE_ENV     | current environment (can be either `development` or `production`)                                                           |

## Tauri Config

In your tauri application setup your updater configurations as follows:

```json
"updater": {
      "active": true,
      "dialog": false,
      "endpoints": [
        "https://your-domain.com/release?api_key=<API KEY SIMILAR TO THE ONE IN THE UPDATE SERVER ENV VARIABLE>"
      ],
      "pubkey": "<YOUR PUBLIC KEY>"
    },
```
