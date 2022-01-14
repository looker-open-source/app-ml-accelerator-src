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

import React from "react"
import './ErrorBar.scss'
import {
    MessageBar,
} from "@looker/components"
import { useStore } from '../../contexts/StoreProvider'


/**
 * A simple component that uses the Looker SDK through the extension sdk to display a customized hello message.
 */
export const ErrorBar: React.FC = () => {
  const { state, dispatch } = useStore()

  if (!state.errors ||
    state.errors.length <= 0) {
      return (<></>);
  }

  return (
    <>
      {state.errors?.map(({ errorString, errorLevel, id }: any) => (
        <MessageBar
          onPrimaryClick={() => dispatch({type: 'removeError', id})}
          intent={errorLevel}
          key={"error-message-" + id}
        >
            {errorString}
        </MessageBar>
      ))}
    </>
  )
}
