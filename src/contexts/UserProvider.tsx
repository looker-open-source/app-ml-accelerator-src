/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2021 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import React, { createContext, useContext, useState } from 'react'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import { useStore } from './StoreProvider'

type IUserContext = {
  getSelf?: () => Promise<any>
}

export const UserContext = createContext<IUserContext>({})

type UserProviderProps = {
  children: any
}

export const UserProvider = ({
  children
}: UserProviderProps) => {
  const { extensionSDK, coreSDK } = useContext(ExtensionContext2)
  const { dispatch } = useStore()

  const getSelf = async () => {
    try {
      const { value: user} = await coreSDK.me()
      console.log({user})
      const { value: adminRole } = await coreSDK.search_roles({ name: 'Admin' })
      const adminRoleId = adminRole.length > 0 ? adminRole[0].id : null
      console.log({adminRole})
      dispatch({ type: "setUser", user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        isAdmin: adminRoleId ? user.role_ids.indexOf(adminRoleId) >= 0 : false
      }})
    } catch (err) {
      debugger
      dispatch({ type: 'addError', error: 'Failed to retrieve User' })
    }
  }

  const getAllUsers = async () => {
    try {
      const { value: allUsers } = await coreSDK.all_users({fields: ['first_name', 'last_name', 'email', 'is_disabled']})
      const filteredUsers = allUsers.filter((user: any) =>
        !(user.is_disabled || !user.email)
      )
      console.log({allUsers})
    } catch (err) {
      dispatch({ type: 'addError', error: 'Failed to retrieve Users' })
    }
  }


  return (
    <UserContext.Provider value={{
      getSelf
    }}>
      {children}
    </UserContext.Provider>
  )
}
