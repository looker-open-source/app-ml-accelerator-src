import React, { useContext, useEffect, useState } from "react"
import { useStore } from "../../../contexts/StoreProvider"
import { QueryBuilderContext } from "../../../contexts/QueryBuilderProvider"

export const StaticDataTimeStamp : React.FC = () => {
  const { getStaticDataCreatedTime } = useContext(QueryBuilderContext)
  const { state } = useStore()
  const [ time, setTime ] = useState<any>()
  const { step2 } = state.wizard.steps

  useEffect(() => {
    if (step2.ranQuery?.sql) {
      setTime(undefined)
      return
    }
    buildStaticTime()
  }, [step2.ranQuery])

  const buildStaticTime = async () => {
    const createTime = await getStaticDataCreatedTime?.()
    if (!createTime) { setTime(undefined) }
    setTime(createTime)
  }

  if (!time) { return <></> }

  return (
    <span className="static-data-time">
      Data from: { time.toString() }
    </span>
  )
}
