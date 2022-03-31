import { RanQuery } from "./resultsTable";
import { SelectedFields } from "./selectedFields";

export type InputData = {
  exploreName?: string,
  modelName?: string,
  exploreLabel?: string,
  limit: string,
  sorts: string[],
  selectedFields: SelectedFields,
  uid?: string,
  bqModelName: string,
  target?: string,
  arimaTimeColumn?: string,
}

export type SaveInputDataProps= {
  query: InputData | RanQuery | undefined,
  uid: string,
  bqModelName: string,
  target: string,
  arimaTimeColumn?: string
}
