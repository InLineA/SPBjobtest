import React, { useRef, useState } from 'react'
import UserList from './components/UserList'
import UserInfo from './components/UserInfo'
import styles from './App.module.css'

function App() {
    const [currentUser, setCurrentUser] = useState({})
    const userListRef = useRef()

    const handleUserUpdated = (updatedUser) => {
        userListRef.current?.replaceUser(updatedUser)
        setCurrentUser(updatedUser)
    }

    return (
        <div className={styles.app}>
            <UserList
                ref={userListRef}
                selectUser={setCurrentUser}
                className={styles.userList}
            />
            <UserInfo
                user={currentUser}
                onUserUpdated={handleUserUpdated}
                className={styles.userInfo}
            />
        </div>
    )
}

export default App