import { View } from './view'

export type ExploreData = {
  exploreLabel: string,
  modelName: string,
  exploreName: string,
  viewName: string,
  fieldDetails: any,
  views: Map<string, View>
}
