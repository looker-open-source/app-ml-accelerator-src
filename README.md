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
<li> Regression</li>
<li>Classification</li>
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

![manifest](/readmeimages/manifest.jpeg)

You can also deploy the JS file to a remote server or content delivery network (CDN) and then reference it via URL.

This option is often the most convenient when used together with continuous deployment automation from your extension’s codebase.

## Permissions for accessing BigQuery API

There must be an existing connection to BigQuery on the Looker Instance. If this connection is established with a Service Account, the <a href="https://cloud.google.com/bigquery/docs/access-control#bigquery.dataEditor">BigQuery Data Editor</a> & <a href="https://cloud.google.com/bigquery/docs/access-control#bigquery.jobUser">BigQuery Job User </a>roles must be assigned to that account.

### Option 1: Using a Service Account

1. Set the three (3) required scoped <a href="https://cloud.google.com/looker/docs/admin-panel-users-user-attributes">Looker user attributes</a>:
<ul>
<li>CONNECTION_NAME</li>
<li>BQML_MODEL_DATASET_NAME</li>
<li>GCP_PROJECT</li>
</ul>

To create a user attribute in Looker, an Admin must go to Admin --> User Attributes --> Create User Attributes.

![create_attribute](/readmeimages/create_attributes.jpeg)

2. Add these three scoped user attributes to your extension app's manifest file.

**([see Looker docs regarding scoped user attributes](https://docs.looker.com/data-modeling/extension-framework/js-r-extension-examples#user_attributes))**

**attribute names** are prepended with `your_project_name`.

     For example, if your Looker project name is `app_ml_accelerator`, then the user attribute name for the `gcp_project` user attribute should look like `app_ml_accelerator_gcp_project`)

 - **NOTE:** If this user attribute is not properly set, the Machine Learning Accelerator app will not be able to use service account authentication and will attempt to fall back on OAuth2 implicit flow instead (using end-user credentials rather than service account)

## Example Manifest
```
project_name: "app-ml-accelerator"

application: ml-accelerator {
  label: "Machine Learning Accelerator"
  file: "bundle.js"
  entitlements: {
    core_api_methods: [
      "all_lookml_models",
      "create_query",
      "run_query",
      "lookml_model_explore",
      "model_fieldname_suggestions",
      "me",
      "user_attribute_user_values",
      "create_sql_query",
      "run_sql_query"
    ]

    use_form_submit: yes
    use_embeds: yes
    use_iframes: yes
    new_window: yes
    new_window_external_urls: ["https://developers.google.com/machine-learning/glossary", "https://cloud.google.com/vertex-ai/docs/model-registry/introduction"]
    scoped_user_attributes: [
      "app_ml_accelerator_bigquery_connection_name",
      "app_ml_accelerator_bqml_model_dataset_name",
      "app_ml_accelerator_gcp_project",
    ]
  }
}

constant: CONNECTION_NAME {
  value: "ml_accelerator"
  export: override_required
}

constant: BQML_MODEL_DATASET_NAME {
  value: "{{_user_attributes['app_ml_accelerator_bqml_model_dataset_name']}}"
}

constant: GCP_PROJECT {
  value: "{{_user_attributes['app_ml_accelerator_gcp_project']}}"
}
```

### Option 2 Using end-user credentials (OAuth):

In GCP Console:

- Enable OAuth Access

  - Go to APIs and Services
    - Go to Libraries, search for "BigQuery API", and make sure it is enabled
    - Go to Credentials, create Credentials > Oauth Client ID > Application type "Web Application"
      - Authorized Javascript origins: "https://your_instance_name.looker.com"
      - Authorized Redirect URIs: "https://your_instance_name.looker.com/extensions/oauth2_redirect"
    - Go to Oauth Consent Screen
      - Add an external user with your email you used for Oauth

![Oauth](/readmeimages/oauth.png)

# Usage
## Prerequisites
<ul>
<li>Familiarity with Looker</li>
<ul>
<li>To upscale your Looker skills or to start your Looker learning journey, please visit <a href="https://connect.looker.com/"> connect.looker.com</a>.</li>
</ul>
<li>Familiarity with basics of machine learning</li>
<ul>
For a review or crash course on machine learning please use <a href="https://developers.google.com/machine-learning/crash-course"> this course</a> or review the official <a href="https://developers.google.com/machine-learning/glossary"> GCP Machine Learning Glossary</a>.
</ul>

</ul>

<ol>
<li>Choose your objective.

![objective](/readmeimages/objective.jpeg)</li>

<li>Select your Looker Explore that will serve as the base of the model.

![inputs](/readmeimages/inputs.jpeg)</li>

<li>Select the fields that will serve as the base of the model. Be sure to try to filter out any null values in the data.

![fields](/readmeimages/fields.jpeg)
</li>

<li>Name your model.</li>

<li>Select your target value.

![test model](/readmeimages/test_model.jpeg)
</li>
<li>Generate Model

![create_model](/readmeimages/create_model.jpeg)
</li>
<li>Review the model performance

![evaluate](/readmeimages/evaluate.jpeg)
</li>
<li>Make predictions

![predict](/readmeimages/predict.jpeg)
</li>

</ol>

## Troubleshooting

<ul>
<li>To be able to access the ML accelerator users must have see_data, explore, and see_sql_runner permissions.</li>

![blank](/readmeimages/blank.jpeg)

<li>If the application is not running as expected, opening up the javascript console can help point to which specific request is failing. </li>

![js error](/readmeimages/js.jpeg)

![cannot](/readmeimages/cannot.jpeg)

<li>Some common issues are Looker permissions are not set correctly. </li>
<li>The BigQuery Service Account the connection is set up with does not have the right permissions. </li>
<li>Ad blockers, specifically ones that block JavaScript requests can cause unintended effects. </li>

<ul>



### For a more customized experience please contact your Looker account team and ask them about the ML accelerator service offerings or a Custom AI Engagement.
