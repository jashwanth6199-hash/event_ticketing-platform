A streamlined digital solution for browsing, booking, and managing event tickets. This project utilizes a decoupled architecture where the frontend communicates with a backend API to handle data persistence.

🚀 Features
Dynamic Event Listing: Real-time event fetching via api.php.

Interactive UI: Modern, responsive design managed through style.css and app.js.

Database Integration: Pre-configured SQL schema for quick setup.

Single-Page Experience: Smooth navigation handled by client-side scripting.

📂 Project Structure
index.html - The main entry point for the user interface.

style.css - Contains all visual styling and layout rules.

app.js - Handles frontend logic, API calls, and DOM manipulation.

api.php - The server-side script acting as the bridge between the UI and the database.

eventhub_db.sql - The database export file containing tables for events and users.

🛠️ Installation & Setup
Clone the Repository:

Bash
git clone https://github.com/jashwanth6199-hash/event_ticketing-platform.git
Database Setup:

Open your MySQL manager (e.g., phpMyAdmin).

Create a database named eventhub.

Import eventhub_db.sql into that database.

Configure API:

Check api.php and ensure the database credentials match your local environment.

Run:

Serve the folder using XAMPP, WAMP, or any PHP-enabled server.
