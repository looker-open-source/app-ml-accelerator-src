import React from "react"
import { NavLink } from "react-router-dom"

type NavBarProps = {
  url: string
}

export const NavBar : React.FC<NavBarProps> = ({ url }) => {
  return (
    <nav className="NavBar-container">
      <NavLink
        to={`${url}/objective`}
        className="NavBar-item">
        Objective
      </NavLink>
      <NavLink
        to={`${url}/source`}
        className="NavBar-item">
        Source
      </NavLink>
      <NavLink
        to={`${url}/model`}
        className="NavBar-item">
        Model
      </NavLink>
      <NavLink
        to={`${url}/review`}
        className="NavBar-item">
        Review
      </NavLink>
      <NavLink
        to={`${url}/apply`}
        className="NavBar-item">
        Apply
      </NavLink>
    </nav>
  )
}
