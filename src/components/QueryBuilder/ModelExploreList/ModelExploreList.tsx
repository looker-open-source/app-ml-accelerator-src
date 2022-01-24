import { ILookmlModel } from "@looker/sdk"
import React from "react"
import { ExploreList } from "./ExploreList"
import "./ModelExploreList.scss"

type ModelExploreListProps = {
  models: ILookmlModel[]
}

export const ModelExploreList: React.FC<ModelExploreListProps> = ({ models }) => {
  return (
    <div className="folder-list">
      {models.map((model: ILookmlModel, index: number) => (
        <ExploreList
          key={index}
          index={index}
          model={model}
        />
      ))}
    </div>
  )
}
