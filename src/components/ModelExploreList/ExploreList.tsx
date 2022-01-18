import React from "react"
import { ILookmlModel, ILookmlModelExplore } from "@looker/sdk"
import { ExploreHeader } from "./ExploreHeader"
import { ExploreItem } from "./ExploreItem"

type ExploreListProps = {
  model: ILookmlModel,
  index: number
}

export const ExploreList: React.FC<ExploreListProps> = ({
  model,
  index,
}) => {
  if (!model.explores || model.explores.length <= 0) { return (<></>)}
  return (
    <div className="folder-div">
      <ExploreHeader index={index} content={model.label} />
      {model.explores.map((explore: ILookmlModelExplore, eIndex: number) => (
        <ExploreItem
          key={eIndex}
          exploreName={explore.name}
          modelName={model.name}
          label={explore.label}
        />
      ))}
    </div>
  )
}
