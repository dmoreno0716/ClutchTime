import React, { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../../../firebase/auth'
import { useAuth } from '../../../contexts/authContext'

const Login = () => {
    const { userLoggedIn } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const onSubmit = async (e) => {
        e.preventDefault()
        if(!isSigningIn) {
            setIsSigningIn(true)
            await doSignInWithEmailAndPassword(email, password)
        }
    }

    const onGoogleSignIn = (e) => {
        e.preventDefault()
        if (!isSigningIn) {
            setIsSigningIn(true)
            doSignInWithGoogle().catch(err => {
                setIsSigningIn(false)
            })
        }
    }

    const mainStyle = {
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    }

    const containerStyle = {
        width: '384px',
        color: '#4B5563',
        padding: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #E5E7EB',
        borderRadius: '12px'
    }

    const headerStyle = {
        textAlign: 'center',
        color: '#1F2937',
        fontSize: '24px',
        fontWeight: '600',
        marginTop: '8px',
        marginBottom: '20px'
    }

    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    }

    const labelStyle = {
        fontSize: '14px',
        color: '#4B5563',
        fontWeight: 'bold'
    }

    const inputStyle = {
        width: '100%',
        marginTop: '8px',
        padding: '8px 12px',
        color: '#6B7280',
        backgroundColor: 'transparent',
        outline: 'none',
        border: '1px solid #D1D5DB',
        borderRadius: '8px',
        transition: 'border-color 0.3s'
    }

    const buttonStyle = {
        width: '100%',
        padding: '8px 16px',
        color: 'white',
        fontWeight: '500',
        borderRadius: '8px',
        backgroundColor: isSigningIn ? '#9CA3AF' : '#4F46E5',
        cursor: isSigningIn ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.3s'
    }

    const linkStyle = {
        color: '#4F46E5',
        fontWeight: 'bold',
        textDecoration: 'none'
    }

    const dividerStyle = {
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        margin: '20px 0'
    }

    const lineStyle = {
        flex: '1',
        borderBottom: '2px solid #E5E7EB'
    }

    const orTextStyle = {
        padding: '0 10px',
        fontSize: '14px',
        fontWeight: 'bold'
    }

    const googleButtonStyle = {
        ...buttonStyle,
        backgroundColor: 'white',
        color: '#374151',
        border: '1px solid #D1D5DB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
    }

    return (
        <div>
            {userLoggedIn && (<Navigate to={'/home'} replace={true} />)}

            <main style={mainStyle}>
                <div style={containerStyle}>
                    <h3 style={headerStyle}>Welcome Back</h3>
                    <form onSubmit={onSubmit} style={formStyle}>
                        <div>
                            <label style={labelStyle}>
                                Email
                            </label>
                            <input
                                type="email"
                                autoComplete='email'
                                required
                                value={email}
                                onChange={(e) => { setEmail(e.target.value) }}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>
                                Password
                            </label>
                            <input
                                type="password"
                                autoComplete='current-password'
                                required
                                value={password}
                                onChange={(e) => { setPassword(e.target.value) }}
                                style={inputStyle}
                            />
                        </div>

                        {errorMessage && (
                            <span style={{color: '#DC2626', fontWeight: 'bold'}}>{errorMessage}</span>
                        )}

                        <button
                            type="submit"
                            disabled={isSigningIn}
                            style={buttonStyle}
                        >
                            {isSigningIn ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    <p style={{textAlign: 'center', fontSize: '14px', marginTop: '20px'}}>
                        Don't have an account? <Link to={'/register'} style={linkStyle}>Sign up</Link>
                    </p>
                    <div style={dividerStyle}>
                        <div style={lineStyle}></div>
                        <div style={orTextStyle}>OR</div>
                        <div style={lineStyle}></div>
                    </div>
                    <button
                        disabled={isSigningIn}
                        onClick={(e) => { onGoogleSignIn(e) }}
                        style={googleButtonStyle}>
                        <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4" />
                            <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853" />
                            <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04" />
                            <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335" />
                        </svg>
                        {isSigningIn ? 'Signing In...' : 'Continue with Google'}
                    </button>
                </div>
            </main>
        </div>
    )
}

export default Login;