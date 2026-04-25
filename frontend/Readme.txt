On login user data update on UI
Login
  ↓
JWT stored in HttpOnly cookie
  ↓
Frontend calls /auth/me
  ↓
User data stored in React Context
  ↓
Accessible everywhere until session ends



//HttpOnly-cookie
tells the browser to store the cookie but restrict client-side script access.
here in this site user data not stored in the client local storage but it is store in HttpOnly-cookie thus on refresh every time call server end point for user information to show in profile

axios.get("http://localhost:5000/api/auth/me", {
  withCredentials: true,
});
this code does send the token to the server automatically, even though you never mention the token anywhere.

That’s the whole point of using HTTP-only cookies

What actually happens in the browser

Browser checks stored cookies for localhost:5000

Finds:

token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...


Automatically attaches it to the request:

Cookie: token=xxxxx


👉 You never touch the token in JS
👉 JavaScript cannot read it
👉 Server can read it via req.cookies.token



Browser ──(cookie: JWT)──► Server
Server ──► verifies JWT
Server ──► extracts email from JWT
Server ──► fetches voter data
 thus dont need to send the email on api call



 If interviewer asks:

Why did you use MySQL Pool?

You answer:

To handle concurrent requests efficiently, avoid connection leakage, and ensure scalability in a real-world voting system.