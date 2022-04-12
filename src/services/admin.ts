import { SHARE_PERMISSION_LEVEL } from "../constants";

export const addSharedPermissions = (sharedList: string[]) => (
  sharedList.map((email) => ({ [email]: SHARE_PERMISSION_LEVEL.edit }))
)

export const removeSharedPermissions = (sharedList: any[]) => (
  sharedList.map((shareObj) =>
    Object.keys(shareObj)[0]
  )
)
