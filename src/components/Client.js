import React from 'react';
import Avatar from 'react-avatar';

const Client = ({ username, isWide }) => {
    return (
        <div className="client">
            <Avatar name={username} size={40} round="14px" />
            <span className="userName">{isWide ? username: ""}</span>
        </div>
    );
};

export default Client;
