
project_name: "Looker BQML App"

application: looker-bqml-app {
  label: "looker-bqml-app"
  url: "http://localhost:8080/bundle.js"
  # file: "bundle.js
  entitlements: {
    core_api_methods: ["all_lookml_models"]
    use_form_submit:  yes
  }
}
