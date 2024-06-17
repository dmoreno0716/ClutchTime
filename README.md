# ClutchTime



ClutchTime
Intern: David “Davey” Moreno
Intern Manager: Jiabao Wu
Intern Director: [Name]
Peer(s): Angelo Luppino, Shirley Jiang
GitHub Repository Link: [Link]
Overview
My project is about a website that allows users to connect with their friends, keep up with the soccer tournament, Copa America, and create predictions for the upcoming matches with their friends. This website caters to viewers around the world, delivering updates regardless of timezones. Additionally, by letting users customize the information they receive, this website cuts through traditional media clutter, enabling fans to focus on specific teams and players they are interested in.
Category: Social Networking, Sports
Story: This website would have users sign up, select their favorite team(s), and then have other users follow them. Users will be able to make predictions on the games, and those predictions will show up in the feed for users and their friends to see and comment on, whether the predictions are right or wrong.
Market: Young adults who have in interest in soccer
Habit: The website will be used as often as there are soccer games; the Copa America tournament lasts from June 21st - July 15th but the website aims to follow games outside of this tournament as well.
Scope: The initial scope of the website will be live coverage with player stats being updated live, as well as the user predictions. Out of scope would be highlights being shared through the user feed.

Product Spec
Based on the app description, this section goes into more detail about what the app should do, and what functionalities it must provide to the users.
User Stories
User stories are actions that the user should be able to perform in your app.

First, focus and identify functionality that is required for your MVP (Minimum Viable Product) that conforms to all the project requirements and expectations. Make sure your technical challenges are part of your MVP.

You should also identify optional / nice-to-have functionalities that would be done as stretch goals during MU Week 8 and 9. Remember, technical challenges should not be optional features, they must be code complete before the end of Week 8!
Required
User can login
User can create an account
User can follow their favorite team(s)
User can create prediction posts
User can view a feed of posts
User can add / remove other users as friends
User can like posts
User can see their profile
Optional
User can create highlight posts
User can go in detail on their predictions (i.e. exact score, who scores, etc..)
User can edit their profile information
User can see their friends’ profile
User can comment on posts
User passwords are encrypted in the database for security
Screen Archetypes

The user opens the website and immediately is shown a login screen where they can also create an account. After they create their account, they follow their favorite team(s). The main page of the website shows the live score of whichever game is playing at the time; if there is no live game, it shows the final score of the most recent game. Below the live score is live statistics. Under that, the user sees upcoming games, where they can then create a prediction of who is going to win. There is a feed for each user that shows predictions from the friends they have connected with. 

Data Model

The data grabbed from the API will be live scores, standings, teams, seasons, and countries.

Server Endpoints

-User registration and account creation
-Selection of favorite team(s) and countries
-Friends list management
-Submitting match predictions
-Retrieving information about right and wrong predictions
Navigation

Project Requirements

-Website connects to a database to store user predictions, profiles and friends.
-Website connects to an API that was not shown in Codepath 
-Users can log in and out
-Users can create new accounts
-Components with complex visual styling will be the user feed and the prediction creation page 
Technical Challenges
For your project, you should demonstrate that you can apply what you’ve learned so far and expand on that knowledge to write code and implement features that go beyond the scope of the projects you worked on during CodePath.

Based on the general idea and direction of your project requirements, your intern manager will create at least two (2) Technical Challenges for you. This section is all about explaining what they are and how you’re planning to tackle them - you’ll work together with your manager to fill it out. 

Technical Challenge #1 - [Name/Small Description]
What
What problem are you solving, and what parts go beyond what you learned in CodePath? 
How
Explain in words how you’ll solve this problem. 

You’re encouraged to expand on this section with pseudo-code, links to external frameworks, architecture / design diagrams, anything that you can use to explain this to others!
Technical Challenge #2
What
How

Database Integration
[Describe what you are using for database storage. For example, Parse, MongoDB, Sequelize, etc.]

-Parse

External APIs
[Describe at least one external API you’re using for your project. For example, Google Maps, Spoonacular, OpenWeather, etc.]

Live-score-API, API-football
Authentication
Signing up: When a new user wants to create an account on the sports prediction app, they will be prompted to provide some basic information such as their name, email address, and password. This information will be sent to the server, which will create a new user account in the database. The server will also generate a unique user ID for the new user and return it to the client along with a token (such as a JSON Web Token or JWT) that can be used to authenticate subsequent requests.
Logging in: When an existing user wants to log in to their account, they will enter their email address and password in the login form. This information will be sent to the server, which will verify that the provided credentials match an existing user account in the database. If the credentials are valid, the server will return a token (such as a JWT) that the client can use to authenticate subsequent requests.
Authentication middleware: To ensure that only authenticated users can access certain routes or endpoints on the server, an authentication middleware can be implemented. This middleware will check whether the incoming request contains a valid token and whether that token corresponds to a valid user account in the database. If the token is valid, the middleware will allow the request to proceed; otherwise, it will return an error response.
Token management: To improve security and prevent unauthorized access, it's important to properly manage tokens on both the client and server sides. For example, tokens should be stored securely in the client's local storage or cookies, and should be transmitted over HTTPS to prevent interception by third parties. Additionally, tokens should have a limited lifespan and be automatically refreshed or renewed when they expire.

Cookies:

Session cookie: This cookie is used to maintain the user's session as they navigate through the website. It typically contains a unique session ID that allows the server to identify the user and their actions during the session.
Authentication cookie: This cookie is used to store information about the logged-in user, such as their username or user ID. It allows the user to remain logged in even after closing their browser or navigating away from the site.
Security cookie: This cookie is used to enhance the security of the website by preventing cross-site request forgery (CSRF) attacks. It typically contains a random value that is checked by the server on each request to ensure that it matches the expected value.
Analytics cookie: This cookie is used to track user behavior and gather analytics data about how users interact with the website. This data can be used to improve the website's functionality and user experience.
Social media cookie: This cookie is used to enable social media sharing and integration with third-party services such as Facebook or Twitter. It typically contains information about the user's social media account and preferences.


Visuals and Interactions
Interesting Cursor Interaction: To create an interesting cursor interaction, the app could use a custom cursor that changes based on the user's actions or the current context. For example, when the user hovers over a button or link, the cursor could change to a pointer finger or a hand, giving visual feedback that the element is clickable. When the user hovers over a text input field, the cursor could change to a text cursor, indicating that they can start typing. This could be accomplished using CSS and JavaScript, by defining different cursor styles for different elements and switching between them based on user interactions.
UI Component with Custom Visual Styling: To create a UI component with custom visual styling, the app could use a design system or style library to define a consistent look and feel for all components. Then, individual components could be customized using CSS variables or classes to apply unique colors, fonts, or other visual properties. For example, the app could define a standard button component with a primary color of blue, but then customize certain buttons to have a red color instead, depending on their purpose or context. This could be accomplished using modern CSS techniques such as variables, flexbox layout, and responsive design.
Loading State: To indicate to users when data is being loaded or processed, the app could use a loading state that provides visual feedback and helps prevent confusion or frustration. For example, when a user makes a prediction for a match, the app could display a loading spinner or progress bar that indicates the prediction is being processed and added to their history. This could be accomplished using HTML, CSS, and JavaScript, by displaying a loading indicator overlay that appears on top of the content while it's being loaded, and disappears once the data is ready. The loading indicator could be designed to match the overall visual style of the app, using the same colors, fonts, and icons as other UI components.

Timeline
Project execution will start in Week 4 of MU. Based on the previously defined requirements, user stories and technical challenges, use the following table to scope out and plan a timeline for deliverables over Week 4 - 9. You can be as detailed as you need, ranging from simply mentioning the user stories, or dividing them into sub-tasks.

You are free to modify the table, add / remove rows or columns, whatever fits your style! The important thing here is that you focus and prioritize certain aspects of your project so you don’t get behind and are ready to deliver the MVP - remember your required features should be code complete before the end of Week 8, including both technical challenges!

We also encourage you to leverage project tracking tools such as GitHub Issues or Meta’s internal Tasks / GSD tooling to keep manage individual units of work.

MU Week
Project Week
Focus
User Stories
4
1
Focus on the components that will serve as the skeleton of your project. You will probably be using most of what you learned in CodePath to set up things like the client and server repositories, initial routing, login / registration, creating a database with object models, etc.

User can login

User can create an account

User can follow favorite team(s)


5
2
Week 5 and 6 should be where you focus on the specific requirements of your project.
User can create / edit / delete posts
(Optional) User passwords are stored and encrypted in the database
User can follow friends
6
3
By this point, you should be getting started with your technical challenges as well.
User can see their feed

User can like posts
7
4
You should focus on finishing your MVP and core requirements. By this point, you should be done with at least one of your technical challenges.
User can see their profile

(Optional) User can create highlight posts
8
5
Continue work on finishing touches and stretch goals for your MVP. By this point, your core functionality and both TAPs should all be in place. It is also a good point to start working on stretch goals that could further expand on the functionality (and technical complexity) of your project.

This week you also have to submit your self-review, make sure you allocate enough time for this alongside your final submission for your project!
(Optional) User can edit their profiles

(Optional) User can comment on posts


9
6
It’s time to show others what you have built! Work on a presentation and demo that you will present to other interns to showcase your work. You are also free to continue polishing and expanding on your project!


10
7
For this week, we have a bunch of extra activities prepared to give you a quick dive of what it is to work at Meta. You will find activities around using internal tools and frameworks, and even committing code to our internal repositories.





