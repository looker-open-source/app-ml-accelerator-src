project_name: "app-bqml-accelerator"

application: bqml-accelerator {
  label: "BQML Accelerator"
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
    new_window_external_urls: ["https://developers.google.com/machine-learning/glossary"]
    scoped_user_attributes: [
      "app_bqml_accelerator_bigquery_connection_name",
      "app_bqml_accelerator_bqml_model_dataset_name",
      "app_bqml_accelerator_gcp_project",
    ]
  }
}

constant: CONNECTION_NAME {
  value: "bigquery"
  export: override_required
}

constant: BQML_MODEL_DATASET_NAME {
  value: "{{_user_attributes['app_bqml_accelerator_bqml_model_dataset_name']}}"
}

constant: GCP_PROJECT {
  value: "{{_user_attributes['gcp_project']}}"
}
