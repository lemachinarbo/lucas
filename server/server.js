import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./routes/apiRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Creates and configures a Fastify server instance.
const fastify = Fastify({
  logger: true, // Enable built-in logging
});

// Registers API routes with the Fastify server.
fastify.register(apiRoutes);

// Serve static frontend files
fastify.register(fastifyStatic, {
  root: path.join(__dirname, "../client/dist"),
  prefix: "/",
});

// Fallback to index.html for frontend routes (SPA support)
fastify.setNotFoundHandler((req, reply) => {
  if (req.url.startsWith("/api")) {
    reply.code(404).send({ error: "API route not found" });
  } else {
    reply.sendFile("index.html"); // Serve frontend for non-API routes
  }
});

//Starts the Fastify server and listens on the specified port and host.
fastify.listen({ port: 7860, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error("Server failed to start:", err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
