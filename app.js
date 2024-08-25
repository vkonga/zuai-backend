const express = require("express");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, "posts.db");

let db = null;

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        app.listen(5000, () => {
            console.log("Server Running at http://localhost:5000/");
        });
    } catch (e) {
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    }
};

initializeDBAndServer();

// Middleware to verify JWT
const authenticateJWT = (request, response, next) => {
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return response.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) return response.sendStatus(403);
        request.user = user;
        next();
    });
};

// User Registration
app.post("/signup/", async (request, response) => {
    const { id, username, password, role } = request.body;
    const hashedPassword = await bcrypt.hash(password, 8);

    try {
        const dbUser = await db.get(`SELECT * FROM users WHERE username = '${username}'`);
        if (dbUser) {
            response.status(400).send("User already exists");
        } else {
            await db.run(`INSERT INTO users (id, username, password) VALUES ('${id}','${username}','${hashedPassword}')`);
            response.send("User created successfully");
        }
    } catch (error) {
        response.status(500).send("Error registering user");
    }
});

// User Login
app.post("/login/", async (request, response) => {
    const { username, password } = request.body;
    try {
        const dbUser = await db.get(`SELECT * FROM users WHERE username = '${username}'`);
        if (dbUser && await bcrypt.compare(password, dbUser.password)) {
            const token = jwt.sign({ id: dbUser.id}, process.env.JWT_SECRET);
            response.json({ token });
        } else {
            response.status(400).send("Invalid username or password");
        }
    } catch (error) {
        response.status(500).send("Error logging in");
    }
});

// Create Post
app.post("/post/", authenticateJWT, async (request, response) => {
    const { id,title,content,createdAt } = request.body;
    const userId = request.user.id;
    try {
        await db.run(`INSERT INTO post (id, user_id,title,content,created_at) VALUES ('${id}','${userId}','${title}','${content}','${createdAt}')`);
        response.send("Post created successfully");
    } catch (error) {
        response.status(500).send("Error creating Post");
    }
});

// Get All Posts
app.get("/posts/", authenticateJWT, async (request, response) => {
    const userId = request.user.id;

    try {
        const postsQuery = await db.all(`SELECT * FROM post WHERE user_id = '${userId}'`);
        response.send(postsQuery);
    } catch (error) {
        response.status(500).send("Error retrieving Posts");
    }
});

// Get a Specific Post
app.get("/posts/:id/", authenticateJWT, async (request, response) => {
    const { id } = request.params;
    const userId = request.user.id;

    try {
        const post = await db.get(`SELECT * FROM post WHERE id = '${id}' AND user_id = '${userId}'`);
        
        if (post) {
            response.send(post);
        } else {
            response.status(404).send("Post not found");
        }
    } catch (error) {
        response.status(500).send("Error retrieving post");
    }
});


// Update Post
app.put("/posts/:id/", authenticateJWT, async (request, response) => {
    const { id } = request.params;
    const { title,content,createdAt } = request.body;

    try {
        await db.run(`UPDATE post SET title = '${title}',created_at = '${createdAt}' , content = '${content}' WHERE id = '${id}'`);
        response.send("Post updated successfully");
    } catch (error) {
        response.status(500).send("Error updating Post");
    }
});

// Delete Post
app.delete("/posts/:id/", authenticateJWT, async (request, response) => {
    const { id } = request.params;

    try {
        await db.run(`DELETE FROM post WHERE id = '${id}'`);
        response.send("Post deleted successfully");
    } catch (error) {
        response.status(500).send("Error deleting Post");
    }
});