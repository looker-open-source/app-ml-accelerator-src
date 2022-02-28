import React, { useEffect, useState } from 'react'

export const TimeRunning: React.FC<{ startTime?: number }> = ({ startTime }) => {
  if (!startTime) { return (<></>) }
  const second = 1000
  const min = second * 60
  const hour = min * 60
  const day = hour * 24
  const [ timePiece, setTimePiece ] = useState<{
    days?: number,
    hours?: string,
    mins?: string,
    seconds?: string
  }>({ days: 0, hours: "00", mins: "00", seconds: "00"})

  const timer = setTimeout(() => {
    const now = Date.now()
    const timeSince = now - startTime
    const days = Math.floor(timeSince / day)
    const hours = Math.floor(timeSince % day / hour).toString()
    const mins = Math.floor(timeSince % day % hour / min).toString()
    const seconds = Math.floor(timeSince % day % hour % min / second).toString()
    setTimePiece({
      days,
      hours: hours.length == 1 ? `0${hours}` : hours,
      mins: mins.length == 1 ? `0${mins}` : mins,
      seconds: seconds.length == 1 ? `0${seconds}` : seconds
    })
  }, 1000)

  useEffect(() => {
    return () => {
      clearTimeout(timer)
    }
  })

  return (
    <div className="job-time-running">
      <div className="job-time-running-label">
        Running Time:
      </div>
      <div className="job-time-running-time">
        { timePiece.days ? `${timePiece.days} days ` : '' } { `${timePiece.hours}:${timePiece.mins}:${timePiece.seconds}`}
      </div>
    </div>
  )
}
