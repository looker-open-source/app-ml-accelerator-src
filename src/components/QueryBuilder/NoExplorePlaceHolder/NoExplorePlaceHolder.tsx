import React from 'react'
import { Icon } from '@looker/components'
import { Explore } from '@looker/icons'
import './NoExplorePlaceHolder.scss'

export const NoExplorePlaceHolder: React.FC = () => {
  return (
    <div className="choose-explore">
      <Icon
        icon={<Explore/>}
        className="choose-explore--icon"
      />
      <div className="choose-explore--text">
          Select an Explore to get Started.
      </div>
    </div>
  )
}
