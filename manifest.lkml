
project_name: "Looker BQML App"

application: looker-bqml-app {
  label: "looker-bqml-app"
  url: "http://localhost:8080/bundle.js"
  # file: "bundle.js
  entitlements: {
    core_api_methods: ["all_lookml_models", "create_query", "run_query", "lookml_model_explore", "model_fieldname_suggestions", "me", "user_attribute_user_values", "create_sql_query", "run_sql_query"]
    use_form_submit:  yes
    use_embeds: yes
    use_iframes:  yes
    scoped_user_attributes: [
      "bigquery_connection_name",
      "google_client_id",
      "bqml_model_dataset_name",
      "gcp_project"
    ]
  }
}

constant: CONNECTION_NAME {
  value: "{{_user_attributes['bigquery_connection_name']}}"
  # value: "4mile_bigquery"
  # value: "bigquery_publicdata_standard_sql"
  export: override_required
}

constant: bqml_model_dataset_name {
  value: "{{_user_attributes['bqml_model_dataset_name']}}"
  # value: "looker_scratch"
  export: override_required
}

constant: GCP_PROJECT {
  value: "{{_user_attributes['gcp_project']}}"
  # value: "sunlit-descent-196820"
  export: override_required
}
