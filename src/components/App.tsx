// Copyright 2021 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
  * This is a sample Looker Extension written in typescript and React. It imports one component, <HelloWorld>.
  * HelloWorld makes a simple call to the Looker API using the Extension Framework's built in authentication,
  * and returns the logged in user.
*/
import React from 'react'
import { ComponentsProvider } from '@looker/components'
import { ExtensionProvider2 } from '@looker/extension-sdk-react'
import { Looker40SDK } from '@looker/sdk'
import { StoreProvider } from '../contexts/StoreProvider'
import { hot } from 'react-hot-loader/root'
import { ExtensionApp } from './ExtensionApp'
import { UserProvider } from '../contexts/UserProvider'

export const App = hot(() => (
  <ExtensionProvider2 type={Looker40SDK}>
    <ComponentsProvider>
      <StoreProvider>
        <UserProvider>
          <ExtensionApp />
        </UserProvider>
      </StoreProvider>
    </ComponentsProvider>
  </ExtensionProvider2>
))
