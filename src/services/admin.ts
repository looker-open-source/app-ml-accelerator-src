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

const getFirstTrainingOptions = (metadata: any) => {
  const firstTraining = metadata.trainingRuns[0]
  if (!firstTraining) { return {} }
  return firstTraining.trainingOptions
}

export const METADATA_LABEL_MAP: { [key: string]: string } = {
  modelId: "Model ID",
  description: "Description",
  labels: "Labels",
  creationTime: "Date created",
  expiration: "Model expiration",
  modifiedTime: "Date modified",
  location: "Location",
  modelType: "Model type",
  minSplitLoss: "Minimum Split Loss",
  maxTreeDepth: "Maximum Tree Depth",
  subsample: "Subsample"
}
