import React from "react";

const ProfileInfo = ({
  userData,
  onFollowUser,
  onUnfollowUser,
  onFollowTeam,
  onUnfollowTeam,
}) => {
  return (
    <div>
      <h1>Profile Info</h1>
      <ul>
        <li>Full Name: {userData.fullName}</li>
        <li>
          PFP:
          <img
            style={{ width: 100, height: 100 }}
            src={userData.profileImg}
            alt="Profile"
          />
        </li>
        <li>Followers: {userData.followers}</li>
        <li>Following: {userData.following}</li>
        <li>Favorite Teams: {userData.favoriteTeams}</li>
        <li>
          <button onClick={onFollowUser}>Follow User</button>
        </li>
        <li>
          <button onClick={onUnfollowUser}>UnFollow User</button>
        </li>
        <li>
          <button onClick={onFollowTeam}>Follow Team</button>
        </li>
        <li>
          <button onClick={onUnfollowTeam}>UnFollow Team</button>
        </li>
      </ul>
    </div>
  );
};

export default ProfileInfo;
