import React from 'react'
import { Switch, Route, Redirect, withRouter, useRouteMatch } from 'react-router-dom'
import './MLWizard.scss'
import NavBar from '../NavBar'

export const _MLWizard: React.FC = () => {
  let { path, url } = useRouteMatch();

  return (
    <div>
      <NavBar url={url}></NavBar>
      <div className="mlwizard-page-contents">
        <Switch>
          <Route exact path="/ml">
            <Redirect to={`${path}/objective`} />
          </Route>
          <Route path={`${path}/objective`}>
            objective
          </Route>
          <Route path={`${path}/source`}>
            source
          </Route>
          <Route path={`${path}/model`}>
            model
          </Route>
          <Route path={`${path}/review`}>
            review
          </Route>
          <Route path={`${path}/apply`}>
            apply
          </Route>
        </Switch>
      </div>
    </div>
  )
}

export const MLWizard = withRouter(_MLWizard)
