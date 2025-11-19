# 📸 AI Vision Analyzer

An application to analyze images using **Groq AI Vision** (model `meta-llama/llama-4-scout-17b-16e-instruct`) with a Node.js backend and ReactJS frontend.

---

## ⚙️ Installation & Local Setup

### 1️⃣ Clone the project

```bash
git clone <repo-url>
cd project-root
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
```

Run the backend:

```bash
node server.js
```

Default: `http://localhost:5000`

---

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file:

```
REACT_APP_API_URL=http://localhost:5000
```

Run the frontend:

```bash
npm start
```

Default: `http://localhost:3000`

---

## 🔌 API

**POST /api/analyze**

### Request Body:

```json
{
  "image": "<base64-or-url>",
  "prompt": "Describe the image"
}
```

### Response:

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "AI-generated description of the image"
      }
    }
  ]
}
```

---

## 🔄 Frontend Flow

1. User selects or pastes an image (URL or Base64).
2. User enters a prompt describing what they want to analyze.
3. Frontend sends POST request to `http://localhost:5000/api/analyze` with `{ image, prompt }`.
4. Backend receives the request and calls Groq AI Vision API using `meta-llama/llama-4-scout-17b-16e-instruct`.
5. Backend returns AI analysis result to frontend.
6. Frontend displays the AI-generated description to the user.

```
User (React) --> POST /api/analyze --> Backend (Node.js) --> Groq AI --> Backend returns result --> Frontend displays result
```

---

## ⚠️ Notes

- Backend must use the **current model**: `meta-llama/llama-4-scout-17b-16e-instruct`
- Base64 images must include prefix: `data:image/png;base64,...`
- Ensure **GROQ_API_KEY** is valid and internet is available
- Backend server must be running before using the frontend

---

Developed by **Ha Nguyen**

