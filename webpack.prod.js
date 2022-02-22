// Copyright 2021 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const webpack = require('webpack');
const commonConfig = require("./webpack.config");

module.exports = {
  ...commonConfig,
  mode: "production",
  optimization: {
    chunkIds: "named",
  },
  // **************************
  // TODO: REMOVE THE DOTENV PLUGIN FROM PROD
  // **************************
  plugins: [
    ...commonConfig.plugins,
    new webpack.DefinePlugin({
      BIGQUERY_CONN: JSON.stringify(process.env.BIGQUERY_CONN),
      GOOGLE_CLIENT_ID: JSON.stringify(process.env.GOOGLE_CLIENT_ID),
      BQML_MODEL_DATASET_NAME: JSON.stringify(process.env.BQML_MODEL_DATASET_NAME),
      GCP_PROJECT: JSON.stringify(process.env.GCP_PROJECT)
    })
  ],
};
