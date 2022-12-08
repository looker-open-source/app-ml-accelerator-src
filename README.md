# Machine Learning Accelerator

## local app setup

node version: v17.3.0
install yarn: `npm install --global yarn`
install packages: `yarn install`

For development only:
Add a .env file with the following keys:

```
BIGQUERY_CONN= # the name of the big query connection
GOOGLE_CLIENT_ID= # the client id of your Oauth Client in GCP console
BQML_MODEL_DATASET_NAME=  # BigQuery dataset where you'll be storing views/tables/models
GCP_PROJECT= # name of your GCP project
```

If you are using Heroku to host, ensure you set config variables to the same values as these .env variables

## starting service locally

`yarn develop`

---

## Permissions for accessing BigQuery API

### Option 1: Using end-user credentials (OAuth implicit flow)

In GCP Console:

- Enable OAuth Access

  - Go to APIs and Services
    - Go to Libraries, search for "BigQuery API", and make sure it is enabled
    - Go to Credentials, create Credentials > Oauth Client ID > Application type "Web Application"
      - Authorized Javascript origins: "https://your_instance_name.looker.com"
      - Authorized Redirect URIs: "https://your_instance_name.looker.com/extensions/oauth2_redirect"
    - Go to Oauth Consent Screen
      - Add an external user with your email you used for Oauth

- Give User BigQuery Permissions
  - Go to IAM & Admin
    - Edit the user and give them permission for "BigQuery Data Editor" & "BigQuery Job User"

### Option 2: Using a service account

1. Set the three (3) required scoped Looker user attributes:

   - `looker_client_id` and `looker_client_secret`
     - These refer to Looker API3 credentials
     - You can set default values using one set of API3 credentials (a single Looker admin) for all your users or a group, or you can set individual user values so each of your users is using their own API keys.
   - `access_token_server_endpoint`

     - This is the endpoint for the custom access token server that you'll be using to get access tokens from Google Auth Server.
       - See: https://github.com/4mile/looker-ext-access-token-server
     - **NOTE:** If this user attribute is not properly set, the Machine Learning Accelerator app will not be able to use service account authentication and will attempt to fall back on OAuth2 implicit flow instead (using end-user credentials rather than service account)

     **IMPORTANT:** All three of these user attributes **must be namespaced/scoped for the extension app** ([see Looker docs regarding scoped user attributes](https://docs.looker.com/data-modeling/extension-framework/js-r-extension-examples#user_attributes)), so make sure that the **attribute names** are prepended with `your_project_name_your_project_name_`.

     For example, if your Looker project name is `bqml-accelerator`, then the user attribute name for the `looker_client_id` user attribute should look like `bqml_accelerator_bqml_accelerator_looker_client_id`)

1. Add these three scoped user attributes to your extension app's manifest file as **`scoped_user_attributes`** entitlements

1. Finally, also remember to set the access token server URL in the manifest file as an `external_api_urls` entitlement (so that the extension app will be able to call your access token server to get tokens)
