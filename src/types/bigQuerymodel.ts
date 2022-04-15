export type BigQueryModelMetadata = {
  etag?: string,
  modelReference?: {
    projectId: string
    datasetId: string
    modelId: string
  },
  creationTime?: string,
  lastModifiedTime?: string,
  description?: string,
  labels?: any,
  expirationTime?: string,
  location?: string,
  modelType?: string,
  trainingRuns?: any[],
  featureColumns?: any[],
  labelColumns?: any[]
}
