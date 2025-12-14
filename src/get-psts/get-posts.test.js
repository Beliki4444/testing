import {describe, it} from "vitest";
import {getPosts} from "./index.js";

/**
Асинхронный вызов
<code>async function fetchData()</code>
*/
describe('isArray', () => {
    it('should return true for arrays', async () => {
        const posts = await getPosts();
        const isArray = Array.isArray(posts);
        expect(isArray).toBe(true);
    });

    it('should return min 1 element', async () => {
        const posts = await getPosts();
        const postsLength = posts?.length;
        expect (postsLength).toBeGreaterThan(0);
    });

})