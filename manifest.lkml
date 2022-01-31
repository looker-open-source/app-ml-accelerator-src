
project_name: "Looker BQML App"

application: looker-bqml-app {
  label: "looker-bqml-app"
  url: "http://localhost:8080/bundle.js"
  # file: "bundle.js
  entitlements: {
    core_api_methods: ["all_lookml_models", "create_query", "run_query", "lookml_model_explore"]
    use_form_submit:  yes
    scoped_user_attributes: [
      "bigquery_connection_name",
      "google_client_id"
    ]
    external_api_urls: ["https://bigquery.googleapis.com/bigquery/v2/projects"]
    oauth2_urls: ["https://accounts.google.com/o/oauth2/v2/auth"]
  }
}
