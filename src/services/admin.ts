import { SHARE_PERMISSION_LEVEL } from "../constants";

export const addSharedPermissions = (sharedList: string[]) => (
  sharedList.map((email) => ({ [email]: SHARE_PERMISSION_LEVEL.edit }))
)

export const removeSharedPermissions = (sharedList: any[]) => (
  sharedList.map((shareObj) =>
    Object.keys(shareObj)[0]
  )
)

export const formatMetaData = (metadata: any) => ({
  modelId: metadata.modelReference ? `${metadata.modelReference.projectId}:${metadata.modelReference.datasetId}.${metadata.modelReference.modelId}` : '',
  description: metadata.description,
  labels: metadata.labels || {},
  creationTime: new Date(Number(metadata.creationTime)),
  expiration: metadata.modelExpiration ? new Date(Number(metadata.modelExpiration)) : 'Never',
  modifiedTime: new Date(Number(metadata.lastModifiedTime)),
  location: metadata.location,
  modelType: metadata.modelType,
  minSplitLoss: getFirstTrainingOptions(metadata).minSplitLoss,
  maxTreeDepth: getFirstTrainingOptions(metadata).maxTreeDepth,
  subsample: getFirstTrainingOptions(metadata).subsample
})

export const formatMetaDataBQMLModelTable = (metadata: any) => {
  const stateJson = JSON.parse(metadata[0].state_json)
  return {
    modelId: `${metadata[0].project_name}:${metadata[0].dataset_name}.${metadata[0].model_name}`,
    creationTime: new Date(Number(metadata[0].model_created_at)),
    modifiedTime: new Date(Number(metadata[0].model_updated_at)),
    modelType: stateJson.bqModel.objective,
    ...('min_split_loss' in stateJson.bqModel.advancedSettings && {minSplitLoss: stateJson.bqModel.advancedSettings.min_split_loss}),
    ...('max_tree_depth' in stateJson.bqModel.advancedSettings && {maxTreeDepth: stateJson.bqModel.advancedSettings.max_tree_depth}),
    ...('subsample' in stateJson.bqModel.advancedSettings && {subsample: stateJson.bqModel.advancedSettings.subsample}),
  }
}

const getFirstTrainingOptions = (metadata: any) => {
  const firstTraining = metadata.trainingRuns[0]
  if (!firstTraining) { return {} }
  return firstTraining.trainingOptions
}

export const METADATA_LABEL_MAP: { [key: string]: string } = {
  modelId: "Model ID",
  description: "Description",
  labels: "Label",
  creationTime: "Date created",
  expiration: "Model expiration",
  modifiedTime: "Date modified",
  location: "Location",
  modelType: "Model type",
  minSplitLoss: "Minimum Split Loss",
  maxTreeDepth: "Maximum Tree Depth",
  subsample: "Subsample"
}
