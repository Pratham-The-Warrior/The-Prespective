# 🗞️ The Prespective

**The Prespective** is a web application that combines a modern news reading site with a dynamic user-driven discussion platform. Users can consume verified news and express their perspectives (takes), which are voted on by the community. The most insightful or engaging perspectives rise to the top in the **Trending** section — giving the people a voice in the narrative.

> _A news site that listens as much as it reports._

---

## 🔥 Key Features

### 📰 News Aggregation
- Aggregates news articles from verified APIs or custom editorial sources.
- Categorized by topics like Technology, Politics, Sports, Business, etc.
- Clean UI with article previews and summaries.

### 💭 User Perspectives
- Authenticated users can post **perspectives (takes)** on any news article.
- Takes are short-form content (like X/Twitter) but contextual to the news piece.

### 🚀 Trending Takes
- Takes with the most upvotes, comments, and engagement surface on a **Trending** feed.
- Trending feed updates dynamically to show top user sentiments and insights.

### 📈 Community Voting
- Users can upvote or downvote perspectives.
- Voting determines visibility and trending status.
- Prevents spam or low-quality content from rising.

### 🔗 Threaded Discussions
- Full conversation threads under each take.
- Nested replies, reactions, and real-time discussion support.

### 👥 User Profiles
- Customizable user bios and avatars.
- History of posted takes, likes, and comment activity.

### 🔐 Authentication & Authorization
- Secure login & registration using JWT tokens.
- Passwords hashed with bcrypt.
- Role-based access (admin moderation tools, if enabled).

### 🌐 Real-Time Interactions (Optional)
- WebSockets or long polling for real-time updates on likes, comments, etc.
- Notifications for replies and take performance (WIP).

---

## 🧱 Tech Stack

## 🧱 Tech Stack

| **Layer**             | **Technology**                                                                 |
|-----------------------|---------------------------------------------------------------------------------|
| **Frontend**          | TypeScript, React, Tailwind CSS, Vite                                           |
| **Backend**           | Node.js, Express.js                                                             |
| **Database**          | MongoDB with Mongoose ORM                                                       |
| **Authentication**    | JWT (access/refresh tokens), Bcrypt, Role-based access control (RBAC)          |
| **State Management**  | Redux Toolkit, React Query (for data fetching/caching)                          |
| **Form Handling**     | React Hook Form + Zod/Yup (for validation)                                      |
| **Routing (Client)**  | React Router                                                                    |
| **API Testing / Docs**| Postman, Swagger (OpenAPI)                                                      |
| **Testing**           | Vitest, Jest, Supertest                                                         |
| **Linting / Formatting** | ESLint, Prettier                                                             |
| **CI/CD**             | GitHub Actions, Husky (for pre-commit hooks)                                    |
| **Deployment**        | Vercel     |
| **Env Management**    | dotenv, cross-env                                                               |
| **Version Control**   | Git + GitHub                                                                    |                                               |
| **DevTools**          | React DevTools, Redux DevTools                                                  |
| **Monitoring / Logging** | LogRocket, Sentry, Winston, Morgan                                           |


---

## 
Website : still in progress...

