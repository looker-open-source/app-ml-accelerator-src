import React from "react"
import { Grid } from "@looker/components"
import { BrowseModelGridItem } from "./BrowseModelGridItem"
import './BrowseModels.scss'

type BrowseModelsViewProps = {
  models: any[],
  navigate: (path: string) => void
}

export const BrowseModelsGrid: React.FC<BrowseModelsViewProps> = ({ models, navigate }) => (
  <Grid columns={3} gap="xxlarge">
    { models.map((model, i) => (
      <BrowseModelGridItem model={model} navigate={navigate} key={i}/>
    ))}
  </Grid>
)
