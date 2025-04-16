import React, { useRef, useEffect, useReducer, useState, useLayoutEffect } from 'react'

const INITIAL_PAGE = 1
const PAGE_SIZE = 100

const fetchUsers = async (page = INITIAL_PAGE, limit = PAGE_SIZE) => {
    const response = await fetch(`http://localhost:3000/users?page=${page}&limit=${limit}`)
    if (!response.ok) throw new Error(`Ошибка: ${response.status}`)
    const result = await response.json()
    return result
}

const userReducer = (currentState, action) => {
    switch(action.type){
        case 'next':
            if (currentState.length > PAGE_SIZE * 2)
                return [...currentState.slice(PAGE_SIZE), ...action.payload]
            return [...currentState, ...action.payload]
        case 'prev':
            if (currentState.length > PAGE_SIZE * 2)
                return [...action.payload, ...currentState.slice(0, PAGE_SIZE * 2)]
            return [...action.payload, ...currentState.slice(0, PAGE_SIZE)]
        case 'replace': // добавим replace для обновления пользователя
            return currentState.map(user => user.id === action.payload.id ? action.payload : user)
        default:
            return currentState
    }
}

const UserList = React.forwardRef(({ selectUser }, ref) => {
    const containerRef = useRef()
    const firstElement = useRef()
    const lastElement = useRef()
    const anchorElement = useRef()

    const prevPage = useRef()
    const loading = useRef(false)
    const [currentPage, setCurrentPage] = useState(INITIAL_PAGE)
    const [users, dispatchUsers] = useReducer(userReducer, [])

    useEffect(() => {
        loading.current = true
        fetchUsers(currentPage, PAGE_SIZE)
            .then(res =>
                dispatchUsers({ type: 'next', payload: res.data })
            )
            .finally(
                ()=>{
                    loading.current = false
                }
            )
    }, [])

    useLayoutEffect(() => {
        if (loading.current) return

        if (prevPage.current === undefined) {
            prevPage.current = currentPage
            return
        }

        const container = containerRef.current
        if (!container) return

        if (currentPage < prevPage.current && currentPage > 2) {
            const anchor = anchorElement.current
            const offsetTop = anchor?.offsetTop || 0

            loading.current = true
            fetchUsers(currentPage - 2, PAGE_SIZE)
                .then(res => {
                    dispatchUsers({ type: 'prev', payload: res.data })

                    requestAnimationFrame(() => {
                        container.scrollTop = anchor.offsetTop - offsetTop
                    })
                })
                .finally(
                    ()=>{
                        loading.current = false
                    }
                )
        } else if (currentPage > prevPage.current) {
            loading.current = true
            fetchUsers(currentPage, PAGE_SIZE)
                .then(res => {
                    dispatchUsers({ type: 'next', payload: res.data })
                })
                .finally(
                    ()=>{
                        loading.current = false
                    }
                )
        }

        prevPage.current = currentPage
    }, [currentPage])

    // Observer вниз
    useEffect(() => {
        const el = lastElement.current
        if (!el) return
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !loading.current) {
                setCurrentPage(prev => prev + 1)
            }
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [users.length])

    // Observer вверх
    useEffect(() => {
        const el = firstElement.current
        if (!el) return
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !loading.current) {
                setCurrentPage(prev => (prev - 1 > 0 ? prev - 1 : prev))
            }
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [users.length])

    // Method to replace a user
    const replaceUser = (updatedUser) => {
        dispatchUsers({ type: 'replace', payload: updatedUser });
    };

    // Expose replaceUser method via ref
    React.useImperativeHandle(ref, () => ({
        replaceUser,
    }));

    return (
        <div
            ref={containerRef}
            style={{
                height: '100vh',
                width: '40%',
                overflowY: 'auto',
            }}
        >
            <h1 ref={firstElement}>Список пользователей</h1>
            {
                users.map((user, i) => (
                    <div
                        key={user.id}
                        ref={i === PAGE_SIZE ? anchorElement : null} 
                        onClick={() => selectUser(user)}
                        style={{ marginBottom: '1rem' }}
                    >
                        <h3>{user.id + 1}. {user.name}</h3>
                        <p>{user.jobTitle}</p>
                        <hr />
                    </div>
                ))
            }
            <div ref={lastElement}>⬇️ Next</div>
        </div>
    )
})

export default UserList
