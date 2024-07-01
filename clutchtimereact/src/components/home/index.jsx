import React from 'react'
import { useAuth } from '../../contexts/authContext'

const Home = () => {
    const { currentUser } = useAuth()

    const containerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#333',
        backgroundColor: '#f0f0f0'
    }

    const messageStyle = {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }

    return (
        <div style={containerStyle}>
            <div style={messageStyle}>
                Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.
            </div>
        </div>
    )
}

export default Home;