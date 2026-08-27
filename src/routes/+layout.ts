// Без этого GitHub Pages часто отдаёт 404 на вложенные маршруты вроде
// /tom-1/stoimost, потому что раздаёт статику как файлы, а не роуты.
export const trailingSlash = 'always';
export const prerender = true;
