import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/authContext'
import { doSignOut } from '../../firebase/auth'

const Header = () => {
    const navigate = useNavigate()
    const { userLoggedIn } = useAuth()

    const navStyle = {
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        width: '100%',
        zIndex: '20',
        top: '0',
        left: '0',
        height: '48px',
        borderBottom: '1px solid #E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E5E7EB'
    }

    const linkStyle = {
        fontSize: '14px',
        color: '#2563EB',
        textDecoration: 'underline',
        cursor: 'pointer'
    }

    return (
        <nav style={navStyle}>
            {
                userLoggedIn
                    ?
                    <>
                        <button 
                            onClick={() => { doSignOut().then(() => { navigate('/login') }) }} 
                            style={linkStyle}
                        >
                            Logout
                        </button>
                    </>
                    :
                    <>
                        <Link style={linkStyle} to={'/login'}>Login</Link>
                        <Link style={linkStyle} to={'/register'}>Register New Account</Link>
                    </>
            }
        </nav>
    )
}

export default Header;