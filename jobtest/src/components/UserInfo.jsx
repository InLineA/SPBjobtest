import React, { useEffect, useState } from 'react'

function UserInfo({ user, onUserUpdated }) {
    const [name, setName] = useState(user?.name || '')
    const [jobTitle, setJobTitle] = useState(user?.jobTitle || '')
    const [department, setDepartment] = useState(user?.department || '')
    const [company, setCompany] = useState(user?.company || '')

    const [status, setStatus] = useState(null)
    const [message, setMessage] = useState('')

    useEffect(() => {
        setName(user?.name || '') // Ensure default value
        setJobTitle(user?.jobTitle || '') // Ensure default value
        setDepartment(user?.department || '') // Ensure default value
        setCompany(user?.company || '') // Ensure default value
        setStatus(null)
        setMessage('')
    }, [user?.id])

    const updateUser = async () => {
        try {
            const response = await fetch(
                `http://localhost:3000/users/${user.id}`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, jobTitle, department, company })
                }
            )

            if (!response.ok) throw new Error('Ошибка при обновлении')

            const updatedUser = await response.json()
            setStatus('success')
            setMessage('✅ Пользователь успешно обновлён')

            onUserUpdated(updatedUser)

            setTimeout(() => {
                setStatus(null)
                setMessage('')
            }, 3000)
        } catch (err) {
            setStatus('error')
            setMessage('❌ Ошибка при обновлении пользователя', err.message)
        }
    }

    if (!(user?.id + 1)) return <h3>👈 Выберите пользователя</h3>

    return (
        <div>
            <label>Имя</label>
            <input value={name} onChange={e => setName(e.target.value)} />
            <br />

            <label>Должность</label>
            <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
            <br />

            <label>Департамент</label>
            <input value={department} onChange={e => setDepartment(e.target.value)} />
            <br />

            <label>Компания</label>
            <input value={company} onChange={e => setCompany(e.target.value)} />
            <br />

            <button onClick={updateUser}>Сохранить</button>

            {status && (
                <div style={{ marginTop: 10, color: status === 'success' ? 'green' : 'red' }}>
                    {message}
                </div>
            )}
        </div>
    )
}

export default UserInfo