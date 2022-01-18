import React from "react";

type ExploreHeaderProps = {
  content: any,
  index: number
}

export const ExploreHeader: React.FC<ExploreHeaderProps> = ({ content, index }) => {
  return (
    <div className={index ? "folder-header" : "first-folder-header"}>
      {content}
    </div>
  )
}
