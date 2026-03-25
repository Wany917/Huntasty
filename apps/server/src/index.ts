import { createContext } from "@Huntasty/api/context";
import { appRouter } from "@Huntasty/api/routers/index";
import { auth } from "@Huntasty/auth";
import { env } from "@Huntasty/env/server";
import { cors } from "@elysiajs/cors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Elysia } from "elysia";
import logixlysia from "logixlysia";

new Elysia()
	.use(
		logixlysia({
			config: {
				showStartupMessage: true,
				startupMessageFormat: "simple",
				timestamp: {
					translateTime: "yyyy-mm-dd HH:MM:ss.SSS",
				},
				ip: true,
				logFilePath: "./logs/huntasty.log",
				customLogFormat:
					"{now} {level} {duration} {method} {pathname} {status} {message} {ip}",
			},
		}),
	)
	.use(
		cors({
			origin: env.CORS_ORIGIN,
			methods: ["GET", "POST", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.all("/api/auth/*", async (context) => {
		const { request, status } = context;
		if (["POST", "GET"].includes(request.method)) {
			return auth.handler(request);
		}
		return status(405);
	})
	.all("/trpc/*", async (context) => {
		const res = await fetchRequestHandler({
			endpoint: "/trpc",
			router: appRouter,
			req: context.request,
			createContext: () => createContext({ context }),
		});
		return res;
	})
	.get("/", () => "OK")
	.listen(3000, () => {
		console.log("Server is running on http://localhost:3000");
	});
