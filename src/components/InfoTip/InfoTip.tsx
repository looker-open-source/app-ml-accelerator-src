import React from "react"
import { Icon, Tooltip } from "@looker/components"
import { Info } from "@styled-icons/material"

type InfoTipProps = {
  content: string
  placement?: string
  className?: string
}

export const InfoTip : React.FC<InfoTipProps> = ({ content, placement, className }) => {
  { /* @ts-ignore */ }
  return (<Tooltip content={content}  placement={placement || 'auto'} delay="none">
    { /* @ts-ignore */ }
    <Icon icon={<Info />} size="xsmall" className={`infotip ${className || ''}`}></Icon>
  </Tooltip>)
}
