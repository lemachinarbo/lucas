# Lucas  
An API for Tracking Emotions  

## Installation Guide  

1. **Install DDEV:**  
   Visit [https://ddev.com/get-started/](https://ddev.com/get-started/) and follow the installation instructions.  

2. **Create a local project folder:**  
   ```bash
   mkdir ~/projects/lucas
   cd ~/projects/lucas
   ```  

3. **Prepare to clone a private repository:**  
   - Install the GitHub CLI (Mac):  
     ```bash
     brew install gh
     ```  
     For more details, visit the [GitHub CLI installation guide](https://github.com/cli/cli?tab=readme-ov-file#installation).  
   - Authenticate with GitHub:  
     ```bash
     gh auth login
     ```  
     Follow the prompts to log in.  

4. **Clone the repository:**  
   ```bash
   git clone https://github.com/lemachinarbo/lucas.git .
   ```  
   *(Adding the `.` at the end ensures the repository's contents are cloned directly into your current folder. Without it, a nested folder with the repository name will be created.)*  

5. **Set up environment variables:**  
   Create a `.env` file in the project root and add:  
   ```plaintext
   OPENAI_API_KEY=XXXX
   ```  
   *(Replace `XXXX` with your API key.)*  

6. **Start DDEV:**  
   ```bash
   ddev start
   ```  

7. **Run Vite:**  
   - Access the container:  
     ```bash
     ddev ssh
     ```  
   - Inside the container, run:  
     ```bash
     npm run frontend
     ```  

8. **Test the project:**  
   Open [https://lucas.ddev.site:5173/](https://lucas.ddev.site:5173/) in your browser.  


<!-- The server.js file is a Node.js application that uses the Fastify framework to create a server with several functionalities. Here's a breakdown of what this app is about:

Environment and Modules:

It loads environment variables using dotenv.
It uses Fastify for the server, along with several plugins like Swagger for API documentation, Basic Auth for authentication, Rate Limit for limiting requests, and WebSocket for real-time communication.
It integrates with Firebase Firestore for database operations and OpenAI for AI functionalities.

Error Handling:

It sets up a global error handler to log errors and send appropriate responses based on the environment.
Plugins:

Basic Auth: Validates requests using a username and password from environment variables.
Rate Limiting: Limits requests to 100 per minute.
Swagger: Provides API documentation at the /documentation route.
WebSocket: Supports WebSocket connections for real-time data streaming.
Routes:

Health Check: A public route (/health) to check if the server is running.
Root Route: Returns a message with guiding principles and guardrails.
OpenAI Routes:
/testOpenAI: Tests the connection to the OpenAI API.
/chat: Allows chatting with OpenAI models.
Emotion Tracker Routes:
/addEmotion: Adds a new emotion entry to the Firestore database.
/getEmotions: Retrieves emotion entries based on query parameters.
Transcription Stream: A WebSocket endpoint (/transcribe-stream) for real-time audio transcription using OpenAI's Whisper model.
Static Content:

Defines guiding principles and guardrails, which are likely used in the root route response.
Helper Functions:

Includes a function to sanitize input using the punycode library.
Server Startup and Shutdown:

Starts the server on a specified port and handles graceful shutdown on receiving termination signals.
Overall, this app is a multi-functional server that provides API endpoints for health checks, chatting with OpenAI, managing emotion entries, and real-time audio transcription. It also includes security features like basic authentication and rate limiting -->