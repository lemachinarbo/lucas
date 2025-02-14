# Use Node.js as the base image
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the full project
COPY . .

# Expose the port Fastify runs on
EXPOSE 7860

# Start the Fastify server
CMD ["node", "server/server.js"]
