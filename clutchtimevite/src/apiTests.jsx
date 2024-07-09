import { useEffect, useState } from "react";
import { fetchUserData } from "./services/hooks/fetchUserData";
import { followUser, unFollowUser } from "./services/api/followUser";
import { favoriteTeam, unFavoriteTeam } from "./services/api/favoriteTeam";
import ProfileInfo from "./components/apiTests/Profileinfo";
import {
  fetchAllFinishedGamesInLeagueInfo,
  fetchAllLeagueInfo,
  fetchPinnedMatchesInfo,
  fetchScheduledGamesInLeagueInfo,
  fetchUpcomingLeagueInfo,
} from "./services/api/getMatchDetails";
import { auth } from "./firebase/firebase";

function Test() {
  const [userData, setUserData] = useState({
    fullName: "NAME",
    profileImg: "IMAGEURL",
    following: [],
    followers: [],
    favoriteTeams: [],
  });
  const [leagueData, setLeagueData] = useState([]);
  const [upcomingLeagueData, setUpcomingLeagueData] = useState();
  const [finishedGamesInleagueData, setFinishedGamesInleagueData] = useState(
    []
  );
  const [scheduledGamesInleagueData, setScheduledGamesInleagueData] = useState(
    []
  );
  const [pinnedMatchesData, setPinnedMatchesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoading) {
      fetchUserData(setUserData, setIsLoading);
      fetchAllLeagueInfo(setLeagueData, "CA2024", "2024");
      fetchUpcomingLeagueInfo(setUpcomingLeagueData, "CA2024");
      fetchAllFinishedGamesInLeagueInfo(
        setFinishedGamesInleagueData,
        "CA2024",
        "2024"
      );
      fetchScheduledGamesInLeagueInfo(
        setScheduledGamesInleagueData,
        "CA2024",
        "2024"
      );
      fetchPinnedMatchesInfo(
        setPinnedMatchesData,
        "CA2024",
        "2024",
        auth.currentUser.uid
      );
    }
  }, [isLoading]);

  const handleFollowUser = () => {
    followUser(
      "prh2kfVuhgfY8USvNZIw6vPW0Kt2",
      "RIqIdVT4Wdaaujsnv2sxE0MgZuf2"
    ).then(() => {
      setIsLoading(true);
    });
  };

  const handleUnfollowUser = () => {
    unFollowUser(
      "prh2kfVuhgfY8USvNZIw6vPW0Kt2",
      "RIqIdVT4Wdaaujsnv2sxE0MgZuf2"
    ).then(() => {
      setIsLoading(true);
    });
  };

  const handleFollowTeam = () => {
    favoriteTeam("Real Madrid", "prh2kfVuhgfY8USvNZIw6vPW0Kt2").then(() => {
      setIsLoading(true);
    });
  };

  const handleUnfollowTeam = () => {
    unFavoriteTeam("Real Madrid", "prh2kfVuhgfY8USvNZIw6vPW0Kt2").then(() => {
      setIsLoading(true);
    });
  };

  return (
    <div style={{ flex: 1 }}>
      <ProfileInfo
        userData={userData}
        onFollowUser={handleFollowUser}
        onUnfollowUser={handleUnfollowUser}
        onFollowTeam={handleFollowTeam}
        onUnfollowTeam={handleUnfollowTeam}
      />
      <div>
        <h1>Dashboard</h1>
        <ul>
          <li>
            All Games{" "}
            <ul>
              {leagueData.map((match) => (
                <li key={match.matchID}>
                  <img
                    src={match.team1.teamIconUrl}
                    alt={`${match.team1.teamName} logo`}
                    style={{ width: "30px", height: "30px" }}
                  />
                  {match.team1.teamName}
                  {" vs "}
                  {match.team2.teamName}
                  <img
                    src={match.team2.teamIconUrl}
                    alt={`${match.team2.teamName} logo`}
                    style={{ width: "30px", height: "30px" }}
                  />
                  <ul>
                    <li>
                      {match.matchResults[0]?.pointsTeam1 || "0"}
                      {" - "}
                      {match.matchResults[0]?.pointsTeam2 || "0"}
                    </li>
                    <li>{match.matchDateTime}</li>
                  </ul>
                </li>
              ))}
            </ul>
          </li>
          <li>
            Next Match in League:
            <ul>
              {upcomingLeagueData && (
                <li key={upcomingLeagueData.matchID}>
                  <img
                    src={upcomingLeagueData.team1.teamIconUrl}
                    alt={`${upcomingLeagueData.team1.teamName} logo`}
                    style={{ width: "30px", height: "30px" }}
                  />
                  {upcomingLeagueData.team1.teamName}
                  {" vs "}
                  {upcomingLeagueData.team2.teamName}
                  <img
                    src={upcomingLeagueData.team2.teamIconUrl}
                    alt={`${upcomingLeagueData.team2.teamName} logo`}
                    style={{ width: "30px", height: "30px" }}
                  />
                  <ul>
                    <li>
                      {upcomingLeagueData.matchResults[0]?.pointsTeam1 || "0"}
                      {" - "}
                      {upcomingLeagueData.matchResults[0]?.pointsTeam2 || "0"}
                    </li>
                    <li>{upcomingLeagueData.matchDateTime}</li>
                  </ul>
                </li>
              )}
            </ul>
          </li>
          <li>
            Soon to be Football Games List (Finished):{" "}
            <ul>
              {finishedGamesInleagueData.map((match) => (
                <li key={match.matchID}>
                  <img
                    src={match.team1.teamIconUrl}
                    alt={`${match.team1.teamName} logo`}
                    style={{ width: "30px", height: "30px" }}
                  />
                  {match.team1.teamName}
                  {" vs "}
                  {match.team2.teamName}
                  <img
                    src={match.team2.teamIconUrl}
                    alt={`${match.team2.teamName} logo`}
                    style={{ width: "30px", height: "30px" }}
                  />
                  <ul>
                    <li>
                      {match.matchResults[0]?.pointsTeam1 || "0"}
                      {" - "}
                      {match.matchResults[0]?.pointsTeam2 || "0"}
                    </li>
                    <li>{match.matchDateTime}</li>
                  </ul>
                </li>
              ))}
            </ul>
          </li>
          <li>
            Soon to be Football Games List (Scheduled):{" "}
            <ul>
              {scheduledGamesInleagueData.map((match) => (
                <li key={match.matchID}>
                  <img
                    src={match.team1.teamIconUrl}
                    alt={`${match.team1.teamName} logo`}
                    style={{ width: "30px", height: "30px" }}
                  />
                  {match.team1.teamName}
                  {" vs "}
                  {match.team2.teamName}
                  <img
                    src={match.team2.teamIconUrl}
                    alt={`${match.team2.teamName} logo`}
                    style={{ width: "30px", height: "30px" }}
                  />
                  <ul>
                    <li>
                      {match.matchResults[0]?.pointsTeam1 || "0"}
                      {" - "}
                      {match.matchResults[0]?.pointsTeam2 || "0"}
                    </li>
                    <li>{match.matchDateTime}</li>
                  </ul>
                </li>
              ))}
            </ul>
          </li>
          <li>
            Pinned Matches (Matches involving teams you follow):{" "}
            <ul>
              {pinnedMatchesData.map((match) => (
                <li key={match.matchID}>
                  <img
                    src={match.team1.teamIconUrl}
                    alt={`${match.team1.teamName} logo`}
                    style={{ width: "30px", height: "30px" }}
                  />
                  {match.team1.teamName}
                  {" vs "}
                  {match.team2.teamName}
                  <img
                    src={match.team2.teamIconUrl}
                    alt={`${match.team2.teamName} logo`}
                    style={{ width: "30px", height: "30px" }}
                  />
                  <ul>
                    <li>
                      {match.matchResults[0]?.pointsTeam1 || "0"}
                      {" - "}
                      {match.matchResults[0]?.pointsTeam2 || "0"}
                    </li>
                    <li>{match.matchDateTime}</li>
                  </ul>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
      <div>
        <h1>Feed</h1>
      </div>
      <div>
        <h1>News</h1>
        <ul>
          <li>
            All News:
            <ul>
              <li>News Picture:</li>
              <li>News Source Name:</li>
              <li>News Title:</li>
              <li>News Desc:</li>
            </ul>
          </li>
          <li>Hot News: </li>
          <li>Transfer News: </li>
        </ul>
      </div>
    </div>
  );
}

export default Test;
