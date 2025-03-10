import GithubSvg from "./assets/github.svg";
import XSvg from "./assets/x.svg";
// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Jianxing Xu';
export const SITE_DESCRIPTION = 'Welcome to X space!';

export const Menus = [
	{
		tile: 'NOTES',
		link: '/notes'
	},
	{
		tile: 'REVIEW',
		link: '/reviews'
	},
	{
		tile: 'PROJECTS',
		link: '/projects'
	},
	{
		tile: 'RSS',
		link: '/rss.xml'
	}
]

export const Medias = [
	{
		tile: 'twitter',
		link: 'https://x.com/xu_xuany',
		icon: XSvg
	},
	{
		tile: 'github',
		link: 'https://github.com/jianxing-xu',
		icon: GithubSvg
	}
]