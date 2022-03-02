# Looker BQML Extension App

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


## permissions for accessing GoogleAPIs BigQuery
In GCP Console

- Enable Oauth Access
  Go to APIs and Services
    Go to Libraries, search for "BigQuery API", and make sure it is enabled
    Go to Credentials, create Credentials > Oauth Client ID > Application type "Web Application"
      *  Authorized Javascript origins: "https://your_instance_name.looker.com"
      *  Authorized Redirect URIs: "https://your_instance_name.looker.com/extensions/oauth2_redirect"
    Go to Oauth Consent Screen
      *  Add an external user with your email you used for Oauth

- Give User BigQuery Permissions
  Go to IAM & Admin
    Edit the user and give them permission for "BigQuery Data Editor" & "BigQuery Job User"
