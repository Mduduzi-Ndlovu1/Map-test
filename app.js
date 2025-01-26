// scripts/app.js
import { sampleData } from "data.js";

// For User Dashboard
const loadUserData = () => {
  const userRatingEl = document.getElementById("user-rating");
  const userCommentsEl = document.getElementById("user-comments");

  // Simulate fetching user data
  const user = sampleData.users[0]; // Assume first user for now
  userRatingEl.textContent = `Rating: ${user.rating}`;
  user.comments.forEach((comment) => {
    const li = document.createElement("li");
    li.textContent = comment;
    userCommentsEl.appendChild(li);
  });
};

// For Manager Dashboard
const loadManagerData = () => {
  const casesPostedEl = document.getElementById("cases-posted");
  const leagueScoreEl = document.getElementById("league-score");
  const areaStatusEl = document.getElementById("area-status");
  const postTypesEl = document.getElementById("post-types");

  const { casesPosted, leagueScore, areaStatus } = sampleData.managerStats;
  casesPostedEl.textContent = casesPosted;
  leagueScoreEl.textContent = leagueScore;
  areaStatusEl.textContent = areaStatus;

  sampleData.posts.forEach((post) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${post.type}</td>
      <td>${post.status}</td>
      <td>${post.area}</td>
    `;
    postTypesEl.appendChild(row);
  });
};

// Initialize Pages
if (document.title === "User Dashboard") {
  loadUserData();
} else if (document.title === "Manager Dashboard") {
  loadManagerData();
}
