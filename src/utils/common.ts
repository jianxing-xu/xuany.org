
import { getCollection } from 'astro:content'

export async function getAllPosts() {
	const posts = await getCollection('blog')
	return posts
}