import React from "react"
import { NavLink } from "react-router-dom"

export const NavBar : React.FC = () => {
  return (
    <nav className="NavBar-container">
      <NavLink
        to="/objective"
        className="NavBar-item">
        Objective
      </NavLink>
      <NavLink
        to="/source"
        className="NavBar-item">
        Source
      </NavLink>
      <NavLink
        to="/model"
        className="NavBar-item">
        Model
      </NavLink>
    </nav>
  )
}
