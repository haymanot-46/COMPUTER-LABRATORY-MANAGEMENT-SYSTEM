import React, { useState, useEffect } from 'react';
import profileImageService from '../../../services/ProfileImageService';
import './Avatar.css';

const Avatar = ({ userId, name, size = 'medium', onClick, className = '' }) => {
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    useEffect(() => {
        if (userId) {
            loadProfileImage();
        }
    }, [userId]);
    
    const loadProfileImage = async () => {
        setLoading(true);
        const result = await profileImageService.getProfileImage(userId);
        if (result.success && result.data?.profile_image) {
            setProfileImage(result.data.profile_image);
        } else {
            setError(true);
        }
        setLoading(false);
    };
    
    const getInitials = () => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };
    
    const getSize = () => {
        switch(size) {
            case 'small': return { width: 32, height: 32, fontSize: 14 };
            case 'large': return { width: 80, height: 80, fontSize: 32 };
            case 'medium':
            default: return { width: 48, height: 48, fontSize: 20 };
        }
    };
    
    const sizeStyle = getSize();
    
    if (loading) {
        return (
            <div 
                className={`avatar avatar-loading ${className}`}
                style={{ width: sizeStyle.width, height: sizeStyle.height, borderRadius: '50%', background: '#e2e8f0' }}
            />
        );
    }
    
    if (profileImage && !error) {
        return (
            <img
                src={profileImage}
                alt={name || 'User'}
                className={`avatar avatar-image ${className}`}
                style={{ width: sizeStyle.width, height: sizeStyle.height, borderRadius: '50%', objectFit: 'cover', cursor: onClick ? 'pointer' : 'default' }}
                onClick={onClick}
            />
        );
    }
    
    return (
        <div
            className={`avatar avatar-initials ${className}`}
            style={{
                width: sizeStyle.width,
                height: sizeStyle.height,
                borderRadius: '50%',
                background: `linear-gradient(135deg, #667eea, #764ba2)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: sizeStyle.fontSize,
                fontWeight: 'bold',
                color: 'white',
                cursor: onClick ? 'pointer' : 'default'
            }}
            onClick={onClick}
        >
            {getInitials()}
        </div>
    );
};

export default Avatar;