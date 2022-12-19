# ML Accelerator
## Machine Learning for Business Intelligence

The ML Accelerator is a purpose-built <a href="https://developers.looker.com/extensions/getting-started"> Looker extension </a> designed to give business users access to <a href="https://cloud.google.com/bigquery-ml/docs/introduction"> BigQuery’s machine learning (BQML)</a> capabilities alongside <a href="https://www.looker.com/google-cloud/"> Looker’s visualizations</a> and premier Business Intelligence features.

The extension provides step-by-step guidance and a pathway to learn and use predictive analytics for BI users.

The ML accelerator your organization to:

<ul>
<li> Empower Business Users </li>
<li>Improve Data Capabilities </li>
<li> Democratize Machine Learning </li>
</ul>

# Example Use-cases
<ul>
<li>Outlier Detection </li>
  <ul>
  <li>Use the ML accelerator to predict fraudulent activity using your customer transactions data to help reduce shrinkage costs. </li>
  </ul>

<li>Forecasting  </li>
<ul>
  <li>Use the ML Accelerator to predict customer acquisition costs based on historical data and economic trends to help budget marketing spend and set upcoming revenue goals. </li>
  </ul>

<li>Cohort Analysis</li>
<ul>
  <li>Use the ML Accelerator to predict which customer segments have the largest customer lifetime value (CLV) to focus marketing efforts and advertising spend. </li>
  </ul>


<li> Churn Prediction  </li>
<ul>
  <li>Use the ML Accelerator to predict which customers are most likely to churn and run scenarios on how different marketing campaigns change churn probability. </li>
  </ul>
</ul>

# Installation

Before installing any tool from the <a href="https://cloud.google.com/looker/docs/marketplace"> Marketplace</a>, a Looker admin should ensure that the appropriate features are enabled:
<ul>
<li>To install any piece of content from the Looker Marketplace, enable the Marketplace feature.</li>

<li>To install extensions, enable the Extension Framework feature.</li>
</ul>
To install a tool from the Looker Marketplace:
<ul>
<li>Make sure you have at least the <a href="https://cloud.google.com/looker/docs/admin-panel-users-roles#develop">develop</a>, <a herf="https://cloud.google.com/looker/docs/admin-panel-users-roles#manage_models">manage_models</a>, and <a href="https://cloud.google.com/looker/docs/admin-panel-users-roles#deploy">deploy</a> permissions.</li>

<li>From the Marketplace main menu, select the tool that you want to install, and click its tile.</li>

<li>Looker displays the tool's installation page, which shows a short description of the tool and any needed information about installing and using the tool.</li>

<li>Click Install.</li>

<li>Looker displays pages asking you to accept the tool's license agreements and the Looker permissions that are required by the tool. If you want to accept the license agreements and permission requests, click Accept on these pages.</li>

<li>Each tool requires some configuration information that is specific for that tool, such as a connection name or visualization label. Select or enter the configuration information, and click Install. (After the installation is complete, you can change this configuration information any time using the Manage page.)</li>

Looker will complete the installation. You can now use the installed content
</ul>

## Manual Install

To install the extension, you can build a JS bundle and load the file through your LookML project. The prescribed way to do this is to drag and drop the file into the desired Looker project from finder or a storage client.

You can also deploy the JS file to a remote server or content delivery network (CDN) and then reference it via URL.

This option is often the most convenient when used together with continuous deployment automation from your extension’s codebase.

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



# Usage
## Prerequisites
<ul>
<li>Familiarity with Looker</li>
<ul>
<li>To upscale your Looker skills or to start your Looker learning journey, please visit connect.looker.com.</li>
</ul>
<li>Familiarity with basics of machine learning</li>
<ul>
For a review or crash course on machine learning please use <a href="https://developers.google.com/machine-learning/crash-course"> this course</a> or review the official <a href="https://developers.google.com/machine-learning/glossary"> GCP Machine Learning Glossary</a>.
</ul>

</ul>

## Troubleshooting

## For a more customized experience please contact your Looker account team and ask them about the ML accelerator service offerings or a Custom AI Engagement.

## Deploying the app locally

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
