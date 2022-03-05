import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();
export const app = express();

app.use(express.json());

app.get("/", (req, res) => {
	res.json("Hello World!");
});

app.post(`/posts`, async (req, res) => {
	const { title, content, authorEmail } = req.body;
	const result = await prisma.post.create({
		data: {
			title,
			content,
			author: { connect: { email: authorEmail } },
		},
	});
	res.json(result);
});

app.get(`/posts/:id`, async (req, res) => {
	const { id }: { id?: string } = req.params;

	const post = await prisma.post.findUnique({
		where: { id: Number(id) },
	});
	res.json(post);
});

app.get("/posts", async (req, res) => {
	const { searchString, skip, take } = req.query;

	const or: Prisma.PostWhereInput = searchString
		? {
				OR: [
					{ title: { contains: searchString as string } },
					{ content: { contains: searchString as string } },
				],
		  }
		: {};

	const posts = await prisma.post.findMany({
		where: {
			...or,
		},
		include: { author: true },
		take: Number(take) || undefined,
		skip: Number(skip) || undefined,
	});

	res.json(posts);
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () =>
	console.log(`
🚀 Server ready at: http://localhost:${PORT}
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`),
);

export default server;
